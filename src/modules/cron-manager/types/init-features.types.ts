export interface IInitFeaturesStatusHandler {
  onFeatureInitFailed?: (err: Error) => void;
  onFeatureInitCompleted?: () => void;
}
