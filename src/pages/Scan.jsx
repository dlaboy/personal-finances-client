import React, { useEffect, useRef, useState } from 'react';
// import { OpenAI } from 'openai'; // Commented out
import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

const Scan = ({ onResult }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [imageDataUrl, setImageDataUrl] = useState(null);
  const [receiptUrl, setReceiptUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
  };

  const takePhoto = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);
    canvas.toBlob(uploadToS3, 'image/jpeg');
    const dataUrl = canvas.toDataURL('image/jpeg');
    setImageDataUrl(dataUrl);
    stopCamera();
  };

  const uploadToS3 = async (blob) => {
    setLoading(true);
    const region = import.meta.env.VITE_S3_REGION;
    const bucket = import.meta.env.VITE_S3_BUCKET;

    const s3 = new S3Client({
      region,
      credentials: {
        accessKeyId: import.meta.env.VITE_S3_ACCESS_KEY,
        secretAccessKey: import.meta.env.VITE_S3_SECRET_KEY,
      },
    });

    const fileName = `receipts/receipt-${Date.now()}.jpg`;

    try {
      const upload = new Upload({
        client: s3,
        params: {
          Bucket: bucket,
          Key: fileName,
          Body: blob,
          ContentType: 'image/jpeg',
        },
      });

      await upload.done();
      const url = `https://${bucket}.s3.${region}.amazonaws.com/${fileName}`;
      setReceiptUrl(url);

      // Notify the parent component
        if (onResult) {
        onResult({ receiptUrl: url }); // Send as an object with `receiptUrl` key
        }

      // Optional: log the URL for testing
      console.log('✅ Receipt uploaded to S3:', url);

      // Commented out OpenAI logic
      // await sendToOpenAI(url);
    } catch (err) {
      console.error('S3 Upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  // const sendToOpenAI = async (s3Url) => {
  //   const openAIRequest = {
  //     model: "gpt-4o-mini",
  //     messages: [
  //       {
  //         role: "user",
  //         content: [
  //           {
  //             type: "text",
  //             text: `Analyze the image of this receipt and extract the following details: ...`
  //           },
  //           {
  //             type: "image_url",
  //             image_url: { url: s3Url },
  //           },
  //         ],
  //       },
  //     ],
  //   };

  //   try {
  //     const res = await openai.chat.completions.create(openAIRequest);
  //     const content = res.choices[0].message.content;
  //     const parsed = JSON.parse(content);
  //     setParsedData(parsed);
  //   } catch (err) {
  //     console.error("OpenAI error:", err);
  //   }
  // };

  const resetScan = () => {
    setImageDataUrl(null);
    setReceiptUrl(null);
    // setParsedData(null);
    startCamera();
  };

  return (
    <div className="container py-4 text-center">
      <h3>Scan Receipt</h3>

      {!imageDataUrl && (
        <>
          <video ref={videoRef} className="w-100" style={{ maxWidth: '500px' }} />
          <button className="btn btn-primary mt-3" onClick={takePhoto}>Capture Receipt</button>
        </>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {imageDataUrl && (
        <div>
          <img src={imageDataUrl} alt="Receipt" className="img-fluid my-3" />
          <div className="d-flex justify-content-center gap-3">
            <button className="btn btn-secondary" onClick={resetScan}>Scan Again</button>
          </div>
        </div>
      )}

      {loading && <p>⏳ Uploading receipt to S3...</p>}

      {receiptUrl && (
        <p className="mt-3 text-success">✅ Uploaded to S3: <a href={receiptUrl} target="_blank" rel="noreferrer">View Receipt</a></p>
      )}
    </div>
  );
};

export default Scan;
