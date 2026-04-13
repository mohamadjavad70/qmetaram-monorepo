/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_SUPABASE_URL?: string;
	readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
	readonly VITE_Q_AGENT_WORKER_URL?: string;
	readonly VITE_CONTACT_PHONE?: string;
	readonly VITE_CONTACT_NAME?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
