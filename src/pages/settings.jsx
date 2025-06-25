import React from 'react';
import SettingsPanel from '@/components/ui/SettingsPanel';
import Layout from '@/components/ui/Layout';

export default function SettingsPage() {
  return (
    <Layout title="Settings">
      <div className="max-w-xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-8 text-white">Settings</h1>
        <SettingsPanel />
      </div>
    </Layout>
  );
}
