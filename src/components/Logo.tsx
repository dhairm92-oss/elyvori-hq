import { QuantumHexLogo } from './QuantumHexLogo';

interface LogoProps {
  className?: string;
  isDark?: boolean;
}

export function Logo({ className = '', isDark = true }: LogoProps) {
  return <QuantumHexLogo className={className} isDark={isDark} />;
}
