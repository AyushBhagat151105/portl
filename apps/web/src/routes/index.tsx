import { Hero } from '../components/hero';
import { AppShowcase } from '../components/app-showcase';
import { BentoFeatures } from '../components/bento-features';
import { InstallGuide } from '../components/install-guide';
import { useQrModal } from '../contexts/qr-context';

export function IndexComponent() {
  const { openQr } = useQrModal();

  return (
    <>
      <Hero onOpenQr={openQr} />
      <AppShowcase />
      <BentoFeatures />
      <InstallGuide />
    </>
  );
}
