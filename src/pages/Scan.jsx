import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

const Scan = ({ onResult }) => {
  const webcamRef = useRef(null);
  const [imageDataUrl, setImageDataUrl] = useState(null);
  const [receiptUrl, setReceiptUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImageDataUrl(imageSrc);
    dataUrlToBlob(imageSrc).then(uploadToS3);
  }, []);

  const dataUrlToBlob = (dataUrl) => {
    return fetch(dataUrl).then(res => res.blob());
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

      if (onResult) onResult({ receiptUrl: url });

      console.log('✅ Uploaded to S3:', url);
    } catch (err) {
      console.error('S3 Upload Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetScan = () => {
    setImageDataUrl(null);
    setReceiptUrl(null);
  };

  return (
    <div className="container py-4 text-center">
      <h3>Scan Receipt</h3>

      {!imageDataUrl && (
        <>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={{
              facingMode: 'environment',
            }}
            className="w-100"
            style={{ maxWidth: '500px' }}
          />
          <button className="btn btn-primary mt-3" onClick={capture}>
            Capture Receipt
          </button>
        </>
      )}

      {imageDataUrl && (
        <div>
          <img src={imageDataUrl} alt="Receipt" className="img-fluid my-3" />
          <div className="d-flex justify-content-center gap-3">
            <button className="btn btn-secondary" onClick={resetScan}>
              Scan Again
            </button>
          </div>
        </div>
      )}

      {loading && <p>⏳ Uploading receipt to S3...</p>}

      {receiptUrl && (
        <p className="mt-3 text-success">
          ✅ Uploaded to S3:{' '}
          <a href={receiptUrl} target="_blank" rel="noreferrer">
            View Receipt
          </a>
        </p>
      )}
    </div>
  );
};

export default Scan;
