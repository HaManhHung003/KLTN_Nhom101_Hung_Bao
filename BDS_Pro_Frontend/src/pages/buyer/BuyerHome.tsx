import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, Sparkles } from 'lucide-react';
import { PropertyCard } from '@/components/common/PropertyCard';
import { CLIENT_ROUTES } from '@/config/routes';
import { properties as mockProperties } from '@/data/mockData';
import { propertyService } from '@/services/property.service';
import type { Property } from '@/types';

export function BuyerHome() {
  const [realProperties, setRealProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    propertyService
      .getProperties({ limit: 12 })
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setRealProperties(res.data);
        } else {
          setRealProperties(mockProperties);
        }
      })
      .catch(() => setRealProperties(mockProperties))
      .finally(() => setLoading(false));
  }, []);

  const displayProperties = realProperties.length > 0 ? realProperties : mockProperties;
  const active = displayProperties.filter((p) => p.status === 'active' || !p.status);
  const aiRecommended = [...active].sort((a, b) => (b.aiScore ?? 0) - (a.aiScore ?? 0)).slice(0, 4);

  return (
    <div className="space-y-8">
      <section className="portal-hero shadow-brand-100/40">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="relative max-w-2xl">
          <p className="text-sm font-medium text-brand-100">Hành trình: Khám phá → Xem nhà → Đặt cọc</p>
          <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">
            Tìm ngôi nhà phù hợp với bạn
          </h1>
          <p className="mt-3 text-brand-100">
            Tìm kiếm thông minh trên bản đồ, gợi ý AI theo ngân sách & khu vực
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                placeholder="Nhập quận, dự án, địa chỉ..."
                className="w-full rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 shadow-lg outline-none placeholder:text-slate-400"
              />
            </div>
            <Link
              to={CLIENT_ROUTES.search}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 font-semibold text-brand-700 shadow-lg transition hover:bg-brand-50"
            >
              Tìm kiếm
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link to={CLIENT_ROUTES.rent} className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur transition hover:bg-white/25">
              Cho thuê
            </Link>
            <Link to={CLIENT_ROUTES.buy} className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur transition hover:bg-white/25">
              Mua bán
            </Link>
            {['Căn hộ', 'Nhà phố', 'Quận 7', 'Bình Thạnh'].map((tag) => (
              <Link
                key={tag}
                to={CLIENT_ROUTES.search}
                className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur transition hover:bg-white/25"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* AI Recommendation Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Gợi ý AI cho bạn</h2>
              <p className="text-xs text-slate-500">Chấm điểm chất lượng & tin cậy theo dữ liệu hệ thống</p>
            </div>
          </div>
          <Link to={CLIENT_ROUTES.search} className="text-sm font-semibold text-brand-600 hover:text-brand-700">
            Xem tất cả →
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-slate-400">Đang nạp dữ liệu BĐS...</div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {aiRecommended.map((p) => (
              <PropertyCard key={p.id} property={p} isFavorite={false} />
            ))}
          </div>
        )}
      </section>

      {/* Recent Properties Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Bất động sản mới nhất</h2>
          <Link to={CLIENT_ROUTES.search} className="text-sm font-semibold text-brand-600 hover:text-brand-700">
            Khám phá thêm →
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {active.slice(0, 8).map((p) => (
            <PropertyCard key={p.id} property={p} isFavorite={false} />
          ))}
        </div>
      </section>
    </div>
  );
}
