import { AssetLibraryWorkspace } from '../../../components/assets/AssetLibraryWorkspace';

export default function BrandAssets() {
  return (
    <AssetLibraryWorkspace
      title="Access your shared brand assets."
      description="Download logos, guidelines, approved creatives, videos, and other files your team has shared with you."
      canManage={false}
      portalMode
    />
  );
}
