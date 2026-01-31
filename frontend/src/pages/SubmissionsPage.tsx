import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { submissionsApi } from '../api/submissions';
import { mediaApi } from '../api/media';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Submission } from '../types';
import {
  Inbox, Check, X, Eye, User, MapPin, Ruler,
  Mail, Building, Clock, ChevronRight
} from 'lucide-react';

export function SubmissionsPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | ''>('pending');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['submissions', statusFilter],
    queryFn: () => submissionsApi.list({
      status: statusFilter || undefined,
      per_page: 50,
    }),
  });

  const approveSubmission = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      submissionsApi.approve(id, { review_notes: notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      queryClient.invalidateQueries({ queryKey: ['artifacts'] });
      setShowApproveModal(false);
      setSelectedSubmission(null);
      setReviewNotes('');
    },
  });

  const rejectSubmission = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) =>
      submissionsApi.reject(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      setShowRejectModal(false);
      setSelectedSubmission(null);
      setReviewNotes('');
    },
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-amber-100 text-amber-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
    };
    return `px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`;
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" className="h-64" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Submissions</h1>
          <p className="text-gray-500">Review submissions from external researchers</p>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2">
        {[
          { value: '', label: 'All' },
          { value: 'pending', label: 'Pending' },
          { value: 'approved', label: 'Approved' },
          { value: 'rejected', label: 'Rejected' },
        ].map((option) => (
          <button
            key={option.value}
            onClick={() => setStatusFilter(option.value as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === option.value
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            {option.label}
            {option.value === 'pending' && data?.submissions.filter(s => s.status === 'pending').length ? (
              <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                {data.submissions.filter(s => s.status === 'pending').length}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Submissions List */}
      {data?.submissions.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No submissions found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="divide-y divide-gray-200">
            {data?.submissions.map((submission) => (
              <div
                key={submission.id}
                className="p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedSubmission(submission)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={getStatusBadge(submission.status)}>
                        {submission.status}
                      </span>
                      <span className="text-sm text-gray-500">
                        <Clock className="w-4 h-4 inline mr-1" />
                        {new Date(submission.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="font-medium text-gray-900">
                      {submission.object_name || 'Unnamed object'}
                    </h3>

                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {submission.researcher_name}
                      </span>
                      {submission.researcher_institution && (
                        <span className="flex items-center gap-1">
                          <Building className="w-4 h-4" />
                          {submission.researcher_institution}
                        </span>
                      )}
                      {submission.storage_location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {submission.storage_location}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {submission.image_count} images
                    </span>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submission Detail Modal */}
      <Modal
        isOpen={!!selectedSubmission && !showApproveModal && !showRejectModal}
        onClose={() => setSelectedSubmission(null)}
        title="Submission Details"
        size="lg"
      >
        {selectedSubmission && (
          <div className="space-y-6">
            {/* Status */}
            <div className="flex items-center justify-between">
              <span className={getStatusBadge(selectedSubmission.status)}>
                {selectedSubmission.status}
              </span>
              <span className="text-sm text-gray-500">
                Submitted {new Date(selectedSubmission.created_at).toLocaleString()}
              </span>
            </div>

            {/* Researcher Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Researcher Information</h4>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-gray-500">Name</dt>
                  <dd className="font-medium">{selectedSubmission.researcher_name}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Email</dt>
                  <dd className="font-medium">{selectedSubmission.researcher_email}</dd>
                </div>
                {selectedSubmission.researcher_institution && (
                  <div>
                    <dt className="text-gray-500">Institution</dt>
                    <dd>{selectedSubmission.researcher_institution}</dd>
                  </div>
                )}
                {selectedSubmission.researcher_address && (
                  <div className="col-span-2">
                    <dt className="text-gray-500">Address</dt>
                    <dd>{selectedSubmission.researcher_address}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Artifact Info */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Artifact Information</h4>
              <dl className="space-y-3 text-sm">
                {selectedSubmission.object_name && (
                  <div>
                    <dt className="text-gray-500">Object Name</dt>
                    <dd className="font-medium">{selectedSubmission.object_name}</dd>
                  </div>
                )}
                {selectedSubmission.storage_location && (
                  <div>
                    <dt className="text-gray-500">Storage Location</dt>
                    <dd>{selectedSubmission.storage_location}</dd>
                  </div>
                )}
                {selectedSubmission.dimensions && (
                  <div>
                    <dt className="text-gray-500">Dimensions</dt>
                    <dd>{selectedSubmission.dimensions}</dd>
                  </div>
                )}
                {selectedSubmission.description && (
                  <div>
                    <dt className="text-gray-500">Description</dt>
                    <dd className="whitespace-pre-wrap">{selectedSubmission.description}</dd>
                  </div>
                )}
                {selectedSubmission.notes && (
                  <div>
                    <dt className="text-gray-500">Notes</dt>
                    <dd className="whitespace-pre-wrap">{selectedSubmission.notes}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Images */}
            {selectedSubmission.images && selectedSubmission.images.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  Images ({selectedSubmission.images.length})
                </h4>
                <div className="grid grid-cols-4 gap-2">
                  {selectedSubmission.images.map((img) => (
                    <div key={img.id} className="aspect-square bg-gray-100 rounded overflow-hidden">
                      <img
                        src={`/api/submissions/${selectedSubmission.id}/images/${img.id}/url`}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>';
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Review Notes (if already reviewed) */}
            {selectedSubmission.review_notes && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Review Notes</h4>
                <p className="text-sm text-gray-600">{selectedSubmission.review_notes}</p>
              </div>
            )}

            {/* Actions */}
            {selectedSubmission.status === 'pending' && (
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="danger"
                  onClick={() => setShowRejectModal(true)}
                >
                  <X className="w-4 h-4 mr-2" /> Reject
                </Button>
                <Button
                  onClick={() => setShowApproveModal(true)}
                >
                  <Check className="w-4 h-4 mr-2" /> Approve & Create Artifact
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Approve Modal */}
      <Modal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        title="Approve Submission"
        size="sm"
      >
        <p className="text-gray-600 mb-4">
          This will create a new artifact from the submission and notify the researcher.
        </p>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Review Notes (optional)
          </label>
          <textarea
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            placeholder="Add any notes about this approval..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setShowApproveModal(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => selectedSubmission && approveSubmission.mutate({
              id: selectedSubmission.id,
              notes: reviewNotes || undefined,
            })}
            isLoading={approveSubmission.isPending}
          >
            Approve
          </Button>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Reject Submission"
        size="sm"
      >
        <p className="text-gray-600 mb-4">
          Please provide a reason for rejection. This will be sent to the researcher.
        </p>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rejection Reason
          </label>
          <textarea
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            placeholder="Explain why this submission is being rejected..."
            rows={3}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setShowRejectModal(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => selectedSubmission && rejectSubmission.mutate({
              id: selectedSubmission.id,
              notes: reviewNotes,
            })}
            isLoading={rejectSubmission.isPending}
            disabled={!reviewNotes.trim()}
          >
            Reject
          </Button>
        </div>
      </Modal>
    </div>
  );
}
