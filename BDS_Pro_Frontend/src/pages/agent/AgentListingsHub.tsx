import { useEffect, useState } from 'react';
import { Tabs, TabPanel } from '@/components/common/Tabs';
import { AgentListings } from './AgentListings';
import { MarketSearch } from '@/pages/shared/MarketSearch';
import { MapView } from '@/pages/shared/MapView';
import { statusLabels, statusColors } from '@/utils/format';
import { propertyService } from '@/services/property.service';
import type { Property } from '@/types';
import { BrokerCreatePropertyPage } from '@/pages/broker/BrokerCreatePropertyPage';
import { Plus } from 'lucide-react';

export function AgentListingsHub() {
  const [active, setActive] = useState('mine');
  const [mine, setMine] = useState<Property[]>([]);
  const pipeline = ['draft', 'pending', 'active', 'sold'] as const;

  const fetchMine = () => {
    propertyService
      .getMyProperties()
      .then((res) => {
        if (res && res.data) setMine(res.data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchMine();
  }, []);

  const handleCreatedSuccess = () => {
    fetchMine();
    setActive('mine');
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý tin đăng BĐS của tôi</h1>
          <p className="mt-1 text-slate-500">
            Tạo tin mới ➔ Chờ duyệt ➔ Đã duyệt (Active) ➔ Đã bán/Cho thuê — Quy trình quản lý tập trung
          </p>
        </div>
        <button
          type="button"
          onClick={() => setActive('create')}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 shadow-sm transition"
        >
          <Plus className="h-4 w-4" />
          Tạo tin đăng mới
        </button>
      </div>

      {/* Pipeline summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {pipeline.map((status) => {
          const count = mine.filter((p) => p.status === status).length;
          return (
            <div key={status} className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
              <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColors[status]}`}>
                {statusLabels[status]}
              </span>
              <p className="mt-2 text-2xl font-bold text-slate-900">{count}</p>
            </div>
          );
        })}
      </div>

      <Tabs
        tabs={[
          { id: 'mine', label: 'Tin đăng của tôi' },
          { id: 'create', label: '+ Tạo tin mới' },
          { id: 'market', label: 'Thị trường' },
          { id: 'map', label: 'Bản đồ thực tế' },
        ]}
        active={active}
        onChange={setActive}
      />

      <TabPanel active={active} id="mine">
        <AgentListings embedded />
      </TabPanel>

      <TabPanel active={active} id="create">
        <div className="py-2">
          <BrokerCreatePropertyPage onSuccess={handleCreatedSuccess} />
        </div>
      </TabPanel>

      <TabPanel active={active} id="market">
        <MarketSearch basePath="/agent" title="" description="" filterStatus="all" />
      </TabPanel>

      <TabPanel active={active} id="map">
        <MapView basePath="/agent" title="" description="" />
      </TabPanel>
    </div>
  );
}
