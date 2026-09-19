export type Language = 'en' | 'ar';
export type Theme = 'dark' | 'light';

export interface ServiceItem {
  id: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  badge: string;
  deliverables: string[];
  metrics: string;
  iconName: 'Package' | 'Layout' | 'Users' | 'Megaphone';
}

export interface PricingTier {
  id: string;
  name: string;
  price: string;
  period: string;
  desc: string;
  popular?: boolean;
  projectLimit: string;
  features: string[];
  serviceCoverage: {
    digitalProducts: string;
    webApp: string;
    recruitmentCRM: string;
    marketingAgent: string;
  };
  cta: string;
}

export interface AuthState {
  token: string | null;
  userEmail: string | null;
  organizationName?: string | null;
  isAuthenticated: boolean;
}

export interface DemoRequestPayload {
  name: string;
  email: string;
  message: string;
}
