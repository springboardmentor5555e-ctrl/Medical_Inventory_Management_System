import Modal from '../common/Modal'
import { Building2, Phone, Mail, MapPin, FileText } from 'lucide-react'

export default function SupplierDetailsModal({ supplier, close }) {
  if (!supplier) return null

  const items = [
    { label: 'Registered Entity', value: supplier.companyName, icon: Building2 },
    { label: 'Primary Contact Person', value: supplier.contactPerson || 'Not provided', icon: Building2 },
    { label: 'Telephone / Hotline', value: supplier.phone, icon: Phone },
    {
      label: 'Email Dispatch',
      value: supplier.email?.endsWith('@medistock.local') ? 'Not provided' : supplier.email,
      icon: Mail,
    },
    { label: 'GST / Tax Code', value: supplier.gstNumber || 'Not specified', icon: FileText },
    {
      label: 'Address',
      value: `${supplier.address || ''}, ${supplier.city || ''}, ${supplier.state || ''}, ${supplier.country || ''}`,
      icon: MapPin,
    },
  ]

  return (
    <Modal title={supplier.supplierName} close={close} maxWidth="max-w-xl">
      <div className="space-y-5">
        {/* Top Header banner */}
        <div className="p-4 bg-slate-800 text-white rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/10 rounded-xl text-emerald-400">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold">{supplier.supplierName}</h4>
              <p className="text-xs text-slate-300">{supplier.companyName}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Performance</span>
            <p className="text-xs font-semibold">{supplier.performance || 'Verified'}</p>
          </div>
        </div>

        {/* Details list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {items.map((item, idx) => {
            const Icon = item.icon
            return (
              <div
                key={idx}
                className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-start gap-2.5"
              >
                <Icon className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    {item.label}
                  </p>
                  <p className="text-xs font-bold text-slate-800 break-words mt-0.5">{item.value}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Modal>
  )
}
