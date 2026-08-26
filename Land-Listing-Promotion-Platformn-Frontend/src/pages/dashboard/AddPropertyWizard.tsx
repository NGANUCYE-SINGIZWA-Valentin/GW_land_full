import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { Stepper } from '@/components/wizard/Stepper';
import { PropertyPreviewCard } from '@/components/wizard/PropertyPreviewCard';
import { LandDetailsStep } from '@/components/wizard/steps/LandDetailsStep';
import { LocationPriceStep } from '@/components/wizard/steps/LocationPriceStep';
import { MediaDocumentsStep } from '@/components/wizard/steps/MediaDocumentsStep';
import { ReviewPublishStep } from '@/components/wizard/steps/ReviewPublishStep';
import { Button } from '@/components/ui/Button';
import { AddPropertyFormData, createEmptyFormData, STEPS } from '@/types/addProperty';
import * as listingsApi from '@/api/listings';
import { ApiError } from '@/api/client';

const validateStep = (stepIndex: number, data: AddPropertyFormData): string | null => {
  if (stepIndex === 0) {
    const { title, description } = data.landDetails;
    if (!title || !description) {
      return 'Please fill in the title and description before continuing.';
    }
  }
  if (stepIndex === 1) {
    const { districtId, sectorId, priceRwf, priceUsd, sizeValue } = data.locationPrice;
    if (!districtId || !sectorId) return 'Please select a district and sector.';
    if (!priceRwf && !priceUsd) return 'Please provide a price in RWF and/or USD.';
    if (!sizeValue) return 'Please provide the land size.';
  }
  if (stepIndex === 2) {
    if (data.media.images.length === 0) return 'Please upload at least one photo.';
  }
  return null;
};

export const AddPropertyWizard: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<AddPropertyFormData>(createEmptyFormData());
  const [currentStep, setCurrentStep] = useState(0);
  const [furthestStep, setFurthestStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isPublished, setIsPublished] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const isLastStep = currentStep === STEPS.length - 1;

  const goToStep = (index: number) => {
    setError(null);
    setCurrentStep(index);
  };

  const handleNext = async () => {
    const validationError = validateStep(currentStep, formData);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);

    if (isLastStep) {
      const {
        districtId, sectorId, priceRwf, priceUsd, sizeValue, sizeUnit, latitude, longitude,
        upi, tenureType, landUse, hasRoadAccess, hasWater, hasElectricity,
      } = formData.locationPrice;
      if (!districtId || !sectorId) {
        setError('Please select a district and sector.');
        return;
      }
      setIsPublishing(true);
      try {
        await listingsApi.createListing({
          title: formData.landDetails.title,
          description: formData.landDetails.description,
          district_id: districtId,
          sector_id: sectorId,
          latitude: latitude ? Number(latitude) : undefined,
          longitude: longitude ? Number(longitude) : undefined,
          price_rwf: priceRwf ? Number(priceRwf) : undefined,
          price_usd: priceUsd ? Number(priceUsd) : undefined,
          size_value: Number(sizeValue),
          size_unit: sizeUnit,
          upi: upi || undefined,
          tenure_type: tenureType || undefined,
          land_use: landUse || undefined,
          has_road_access: hasRoadAccess,
          has_water: hasWater,
          has_electricity: hasElectricity,
          images: formData.media.images,
          documents: formData.media.documents,
        });
        setIsPublished(true);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Something went wrong while publishing your listing.');
      } finally {
        setIsPublishing(false);
      }
      return;
    }

    const next = currentStep + 1;
    setCurrentStep(next);
    setFurthestStep((prev) => Math.max(prev, next));
  };

  const handleBack = () => {
    setError(null);
    if (currentStep === 0) {
      navigate('/dashboard');
      return;
    }
    setCurrentStep((prev) => prev - 1);
  };

  if (isPublished) {
    return (
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm h-[80vh] flex flex-col items-center justify-center gap-4">
        <CheckCircle2 size={48} className="text-green-500" />
        <h2 className="text-lg font-semibold text-[#0F172A]">Listing submitted for review</h2>
        <p className="text-sm text-[#64748B]">
          {formData.landDetails.title || 'Your listing'} has been sent to our team and will go live once approved.
        </p>
        <Button onClick={() => navigate('/seller/properties')}>Go to My Properties</Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm flex flex-col">
      <div className="p-6 border-b border-[#E2E8F0]">
        <Stepper currentStep={currentStep} furthestStep={furthestStep} onStepClick={goToStep} />
      </div>

      <div className="flex flex-1 gap-8 p-6">
        <div className="flex-1 min-w-0">
          {currentStep === 0 && (
            <LandDetailsStep
              data={formData.landDetails}
              onChange={(landDetails) => setFormData((prev) => ({ ...prev, landDetails }))}
            />
          )}
          {currentStep === 1 && (
            <LocationPriceStep
              data={formData.locationPrice}
              onChange={(locationPrice) => setFormData((prev) => ({ ...prev, locationPrice }))}
            />
          )}
          {currentStep === 2 && (
            <MediaDocumentsStep data={formData.media} onChange={(media) => setFormData((prev) => ({ ...prev, media }))} />
          )}
          {currentStep === 3 && <ReviewPublishStep data={formData} onEditStep={goToStep} />}

          {error && (
            <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}
        </div>

        <div className="w-72 shrink-0 hidden lg:block">
          <PropertyPreviewCard
            landDetails={formData.landDetails}
            locationPrice={formData.locationPrice}
            media={formData.media}
          />
        </div>
      </div>

      <div className="flex items-center justify-between p-6 border-t border-[#E2E8F0]">
        <Button variant="outline" onClick={handleBack} disabled={isPublishing}>
          {currentStep === 0 ? 'Cancel' : 'Back'}
        </Button>
        <Button onClick={handleNext} disabled={isPublishing}>
          {isPublishing ? 'Publishing…' : isLastStep ? 'Publish' : 'Next'}
        </Button>
      </div>
    </div>
  );
};
