'use client';
import { useState } from 'react';
import { useAccount, useSignMessage } from 'wagmi';

interface IssueCertificateFormProps {
  apiKey: string;
  onSuccess?: () => void;
}

type CertificateType = 'text' | 'image';

export default function IssueCertificateForm({ apiKey, onSuccess }: IssueCertificateFormProps) {
  const { signMessageAsync } = useSignMessage();
  const { address } = useAccount();

  const [certificateType, setCertificateType] = useState<CertificateType>('text');
  const [formData, setFormData] = useState({
    userWallet: '',
    course: '',
    skills: '',
    expiresInDays: 0,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'expiresInDays' ? parseInt(value) || 0 : value,
    }));
    setError('');
    setSuccess('');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('Image size must be less than 10MB');
        return;
      }

      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      setError('');
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.userWallet || !formData.course) {
      setError('User wallet and course are required');
      return;
    }

    if (!formData.userWallet.startsWith('0x') || formData.userWallet.length !== 42) {
      setError('Invalid wallet address');
      return;
    }

    if (certificateType === 'image' && !imageFile) {
      setError('Please upload a certificate image');
      return;
    }

    setLoading(true);

    try {
      // Sign message for Lighthouse encryption
      const message = `Signing to upload certificate data for ${formData.course}`;
      const signedMessage = await signMessageAsync({ message });

      // Parse skills
      const skillsArray = formData.skills
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      // Prepare request body based on certificate type
      let requestBody: any = {
        userWallet: formData.userWallet,
        course: formData.course,
        skills: skillsArray,
        expiresInDays: formData.expiresInDays,
        signedMessage,
        certificateType,
      };

      // If image type, we need to upload the image separately
      if (certificateType === 'image' && imageFile) {
        // Create FormData for image upload
        const formDataWithImage = new FormData();
        formDataWithImage.append('image', imageFile);
        formDataWithImage.append('userWallet', formData.userWallet);
        formDataWithImage.append('course', formData.course);
        formDataWithImage.append('skills', JSON.stringify(skillsArray));
        formDataWithImage.append('expiresInDays', formData.expiresInDays.toString());
        formDataWithImage.append('signedMessage', signedMessage);
        formDataWithImage.append('certificateType', certificateType);

        // Call issue API with FormData
        const res = await fetch('/api/issue', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
          body: formDataWithImage,
        });

        const data = await res.json();

        if (res.ok && data.success) {
          setSuccess(`Certificate issued successfully! CID: ${data.cid}`);
          resetForm();
          if (onSuccess) onSuccess();
        } else {
          setError(data.error || 'Failed to issue certificate');
        }
      } else {
        // Text-based certificate
        const res = await fetch('/api/issue', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(requestBody),
        });

        const data = await res.json();

        if (res.ok && data.success) {
          setSuccess(`Certificate issued successfully! CID: ${data.cid}`);
          resetForm();
          if (onSuccess) onSuccess();
        } else {
          setError(data.error || 'Failed to issue certificate');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      userWallet: '',
      course: '',
      skills: '',
      expiresInDays: 0,
    });
    setImageFile(null);
    setImagePreview(null);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h2 className="text-2xl font-bold text-white mb-6">Issue New Certificate</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Certificate Type Selection */}
        <div>
          <label className="block text-white font-bold mb-3">
            Certificate Type <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setCertificateType('text')}
              className={`p-4 rounded-lg border-2 transition-all ${
                certificateType === 'text'
                  ? 'border-blue-500 bg-blue-900 bg-opacity-30'
                  : 'border-gray-600 bg-gray-700 hover:border-gray-500'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-white font-bold">Text-Based</span>
                <span className="text-gray-400 text-xs text-center">JSON metadata only</span>
              </div>
            </button>
            
            <button
              type="button"
              onClick={() => setCertificateType('image')}
              className={`p-4 rounded-lg border-2 transition-all ${
                certificateType === 'image'
                  ? 'border-blue-500 bg-blue-900 bg-opacity-30'
                  : 'border-gray-600 bg-gray-700 hover:border-gray-500'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-white font-bold">Image-Based</span>
                <span className="text-gray-400 text-xs text-center">Upload certificate image</span>
              </div>
            </button>
          </div>
        </div>

        {/* Image Upload Section (only shown for image type) */}
        {certificateType === 'image' && (
          <div>
            <label className="block text-white font-bold mb-2">
              Certificate Image <span className="text-red-500">*</span>
            </label>
            {!imagePreview ? (
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex flex-col items-center gap-3"
                >
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="text-white font-bold">Click to upload certificate image</span>
                  <span className="text-gray-400 text-sm">PNG, JPG, JPEG (max 10MB)</span>
                </label>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Certificate preview"
                  className="w-full rounded-lg border-2 border-gray-600"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-red-600 hover:bg-red-500 text-white p-2 rounded-full"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            <p className="text-gray-400 text-sm mt-2">
              Upload a designed certificate image. The image will be stored on IPFS and linked to the NFT.
            </p>
          </div>
        )}

        {/* User Wallet */}
        <div>
          <label className="block text-white font-bold mb-2">
            Recipient Wallet Address <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="userWallet"
            value={formData.userWallet}
            onChange={handleInputChange}
            placeholder="0x..."
            className="w-full px-4 py-3 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500"
          />
          <p className="text-gray-400 text-sm mt-1">
            The wallet address of the user receiving the certificate
          </p>
        </div>

        {/* Course Name */}
        <div>
          <label className="block text-white font-bold mb-2">
            Course/Certificate Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="course"
            value={formData.course}
            onChange={handleInputChange}
            placeholder="e.g., Web3 Development Bootcamp"
            className="w-full px-4 py-3 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Skills */}
        <div>
          <label className="block text-white font-bold mb-2">
            Skills <span className="text-gray-500">(Optional)</span>
          </label>
          <textarea
            name="skills"
            value={formData.skills}
            onChange={handleInputChange}
            placeholder="e.g., Solidity, React, Web3.js (comma-separated)"
            rows={3}
            className="w-full px-4 py-3 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500"
          />
          <p className="text-gray-400 text-sm mt-1">
            Comma-separated list of skills covered in the course
          </p>
        </div>

        {/* Expiration */}
        <div>
          <label className="block text-white font-bold mb-2">
            Expiration (Days) <span className="text-gray-500">(Optional)</span>
          </label>
          <input
            type="number"
            name="expiresInDays"
            value={formData.expiresInDays}
            onChange={handleInputChange}
            min="0"
            placeholder="0 = Never expires"
            className="w-full px-4 py-3 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500"
          />
          <p className="text-gray-400 text-sm mt-1">
            Leave as 0 for permanent certificates, or set days for rental/temporary credentials
          </p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="p-4 bg-red-900 bg-opacity-50 border border-red-700 rounded text-red-300">
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-900 bg-opacity-50 border border-green-700 rounded text-green-300">
            ✓ {success}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold rounded text-lg transition-colors"
        >
          {loading ? 'Issuing Certificate...' : 'Issue Certificate'}
        </button>
      </form>
    </div>
  );
}
