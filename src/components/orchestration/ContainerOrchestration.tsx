import React, { useState } from 'react';
import { Tabs } from '../ui/tabs';
import { Card } from '../ui/Card';
import { SwarmManagement } from './SwarmManagement';
import { AdvancedContainerControls } from './AdvancedContainerControls';
import { NetworkManagement } from './NetworkManagement';
import { VolumeManagement } from './VolumeManagement';
import { Server, Network, HardDrive, Activity } from 'lucide-react';

export const ContainerOrchestration: React.FC = () => {
  const [activeTab, setActiveTab] = useState('swarm');

  const tabs = [
    { id: 'swarm', label: 'Swarm Clusters', icon: Server },
    { id: 'containers', label: 'Container Controls', icon: Activity },
    { id: 'networks', label: 'Networks', icon: Network },
    { id: 'volumes', label: 'Volumes', icon: HardDrive },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Container Orchestration
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Advanced container management with Docker Swarm, networking, and storage orchestration
        </p>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="mt-6">
        {activeTab === 'swarm' && <SwarmManagement />}
        {activeTab === 'containers' && <AdvancedContainerControls />}
        {activeTab === 'networks' && <NetworkManagement />}
        {activeTab === 'volumes' && <VolumeManagement />}
      </div>
    </div>
  );
};