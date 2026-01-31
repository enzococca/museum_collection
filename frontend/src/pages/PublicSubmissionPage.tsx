import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { publicSubmissionsApi } from '../api/submissions';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Archive, Upload, Check, AlertCircle, X } from 'lucide-react';

interface UploadedImage {
  file: File;
  preview: string;
  uploaded: boolean;
}

export function PublicSubmissionPage() {
  const [step, setStep] = useState<'form' | 'images' | 'success'>('form');
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [trackingId, setTrackingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    researcher_name: '',
    researcher_email: '',
    researcher_institution: '',
    researcher_address: '',
    storage_location: '',
    object_name: '',
    dimensions: '',
    description: '',
    notes: '',
  });

  // Images
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);

  const createSubmission = useMutation({
    mutationFn: () => publicSubmissionsApi.create(formData),
    onSuccess: (data) => {
      setSubmissionId(data.id);
      setTrackingId(data.tracking_id);
      setStep('images');
      setError(null);
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || 'Failed to create submission');
    },
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createSubmission.mutate();
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    const newImages: UploadedImage[] = Array.from(files)
      .filter(f => f.type.startsWith('image/'))
      .map(file => ({
        file,
        preview: URL.createObjectURL(file),
        uploaded: false,
      }));

    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const uploadImages = async () => {
    if (!submissionId || images.length === 0) return;

    setUploading(true);
    setError(null);

    for (let i = 0; i < images.length; i++) {
      if (images[i].uploaded) continue;

      try {
        await publicSubmissionsApi.uploadImage(submissionId, images[i].file);
        setImages(prev => {
          const newImages = [...prev];
          newImages[i] = { ...newImages[i], uploaded: true };
          return newImages;
        });
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to upload image');
        break;
      }
    }

    setUploading(false);

    // Check if all uploaded
    const allUploaded = images.every(img => img.uploaded);
    if (allUploaded) {
      setStep('success');
    }
  };

  const skipImages = () => {
    setStep('success');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Archive className="w-12 h-12 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Museum Collection Submission
          </h1>
          <p className="mt-2 text-gray-600">
            Submit artifacts for review by our collection team
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'form' ? 'bg-primary-600 text-white' : 'bg-green-500 text-white'
            }`}>
              {step !== 'form' ? <Check className="w-5 h-5" /> : '1'}
            </div>
            <div className={`w-16 h-1 ${step !== 'form' ? 'bg-green-500' : 'bg-gray-300'}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'images' ? 'bg-primary-600 text-white' :
              step === 'success' ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              {step === 'success' ? <Check className="w-5 h-5" /> : '2'}
            </div>
            <div className={`w-16 h-1 ${step === 'success' ? 'bg-green-500' : 'bg-gray-300'}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'success' ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              {step === 'success' ? <Check className="w-5 h-5" /> : '3'}
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-700">{error}</p>
            </div>
            <button onClick={() => setError(null)}>
              <X className="w-5 h-5 text-red-400" />
            </button>
          </div>
        )}

        {/* Step 1: Form */}
        {step === 'form' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Submission Details
            </h2>

            <form onSubmit={handleFormSubmit} className="space-y-6">
              {/* Researcher Info */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-700 border-b pb-2">
                  Your Information
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input
                    label="Full Name *"
                    value={formData.researcher_name}
                    onChange={(e) => setFormData({ ...formData, researcher_name: e.target.value })}
                    required
                    placeholder="Dr. John Smith"
                  />
                  <Input
                    label="Email *"
                    type="email"
                    value={formData.researcher_email}
                    onChange={(e) => setFormData({ ...formData, researcher_email: e.target.value })}
                    required
                    placeholder="john.smith@university.edu"
                  />
                </div>
                <Input
                  label="Institution"
                  value={formData.researcher_institution}
                  onChange={(e) => setFormData({ ...formData, researcher_institution: e.target.value })}
                  placeholder="University of Example"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    value={formData.researcher_address}
                    onChange={(e) => setFormData({ ...formData, researcher_address: e.target.value })}
                    rows={2}
                    placeholder="14 Example Street, London, UK"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Artifact Info */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-700 border-b pb-2">
                  Artifact Information
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input
                    label="Object Name"
                    value={formData.object_name}
                    onChange={(e) => setFormData({ ...formData, object_name: e.target.value })}
                    placeholder="Porcine head"
                  />
                  <Input
                    label="Storage Location"
                    value={formData.storage_location}
                    onChange={(e) => setFormData({ ...formData, storage_location: e.target.value })}
                    placeholder="Cab 65 shelf 5"
                  />
                </div>
                <Input
                  label="Dimensions"
                  value={formData.dimensions}
                  onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                  placeholder="Maximum length 10.7 cm"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    placeholder="Describe the artifact..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={2}
                    placeholder="Any additional information..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                isLoading={createSubmission.isPending}
              >
                Continue to Images
              </Button>
            </form>
          </div>
        )}

        {/* Step 2: Images */}
        {step === 'images' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Upload Images
            </h2>

            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">
                Drag and drop images here, or{' '}
                <label className="text-primary-600 hover:underline cursor-pointer">
                  browse
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleFiles(e.target.files)}
                    className="hidden"
                  />
                </label>
              </p>
              <p className="text-sm text-gray-400">
                Supports JPG, PNG, GIF, TIFF
              </p>
            </div>

            {/* Image List */}
            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-3">
                {images.map((img, index) => (
                  <div key={index} className="relative">
                    <img
                      src={img.preview}
                      alt=""
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                    {img.uploaded && (
                      <div className="absolute inset-0 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <Check className="w-8 h-8 text-green-600" />
                      </div>
                    )}
                    {!img.uploaded && (
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <Button
                variant="secondary"
                onClick={skipImages}
                className="flex-1"
              >
                Skip (No Images)
              </Button>
              <Button
                onClick={uploadImages}
                disabled={images.length === 0 || images.every(i => i.uploaded)}
                isLoading={uploading}
                className="flex-1"
              >
                Upload {images.filter(i => !i.uploaded).length} Image(s)
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 'success' && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Submission Received!
            </h2>
            <p className="text-gray-600 mb-6">
              Thank you for your submission. Our team will review it and notify you via email.
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500 mb-1">Your Tracking ID:</p>
              <p className="text-xl font-mono font-bold text-primary-600">
                {trackingId}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Save this ID to check your submission status
              </p>
            </div>

            <Button
              onClick={() => {
                setStep('form');
                setSubmissionId(null);
                setTrackingId(null);
                setFormData({
                  researcher_name: '',
                  researcher_email: '',
                  researcher_institution: '',
                  researcher_address: '',
                  storage_location: '',
                  object_name: '',
                  dimensions: '',
                  description: '',
                  notes: '',
                });
                setImages([]);
              }}
              variant="secondary"
            >
              Submit Another
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
