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
      <h3 className="mb-3">Scan Receipt</h3>

      {!imageDataUrl && (
        <div className="d-flex flex-column align-items-center">
          <div
            className="camera-wrapper mb-3"
            style={{
              width: '100%',
              maxWidth: '400px',
              aspectRatio: '3/4',
              borderRadius: '12px',
              overflow: 'hidden',
              backgroundColor: '#000',
              position: 'relative',
            }}
          >
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode: 'environment' }}
              mirrored={false}
              playsInline={true}
              className="w-100 h-100 object-fit-cover"
              style={{
                objectFit: 'cover',
                width: '100%',
                height: '100%',
                position: 'absolute',
              }}
            />
          </div>
          <button className="btn btn-primary" onClick={capture}>
            📸 Capture Receipt
          </button>
        </div>
      )}

      {imageDataUrl && (
        <div>
          <img src={imageDataUrl} alt="Receipt" className="img-fluid my-3 rounded shadow" />
          <div className="d-flex justify-content-center gap-3">
            <button className="btn btn-secondary" onClick={resetScan}>
              🔄 Scan Again
            </button>
          </div>
        </div>
      )}

      {loading && <p className="mt-3">⏳ Uploading receipt to S3...</p>}

      {receiptUrl && (
        <p className="mt-3 text-success">
          ✅ Uploaded:{' '}
          <a href={receiptUrl} target="_blank" rel="noreferrer">
            View Receipt
          </a>
        </p>
      )}
    </div>
  );
};

export default Scan;
