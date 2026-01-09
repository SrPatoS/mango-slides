import { useState, useEffect } from "react";
import { X, Plus, Trash2, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ChartDataPoint {
  name: string;
  value: number;
}

interface ChartEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: ChartDataPoint[];
  chartType?: 'bar' | 'pie' | 'line';
  onSave: (data: ChartDataPoint[], type: 'bar' | 'pie' | 'line') => void;
}

export const ChartEditorModal = ({ isOpen, onClose, initialData, chartType, onSave }: ChartEditorModalProps) => {
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [type, setType] = useState<'bar' | 'pie' | 'line'>('bar');

  useEffect(() => {
    if (isOpen) {
      setData(initialData && initialData.length > 0 ? [...initialData] : [
          { name: 'Jan', value: 40 },
          { name: 'Fev', value: 30 },
          { name: 'Mar', value: 20 },
      ]);
      setType(chartType || 'bar');
    }
  }, [isOpen, initialData, chartType]);

  const handleUpdate = (index: number, field: keyof ChartDataPoint, value: string | number) => {
     const newData = [...data];
     newData[index] = { ...newData[index], [field]: value };
     setData(newData);
  };

  const handleAdd = () => {
      setData([...data, { name: 'Novo', value: 10 }]);
  };

  const handleRemove = (index: number) => {
      setData(data.filter((_, i) => i !== index));
  };

  if(!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)' }}>
        <motion.div 
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           exit={{ opacity: 0, scale: 0.95 }}
           className="modal-content"
           style={{ 
               maxWidth: '500px', 
               width: '90%', 
               background: 'var(--bg-sidebar)', 
               borderRadius: '12px', 
               padding: '24px',
               boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
               color: 'var(--text-primary)'
           }}
        >
          <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>Editor de Gráfico</h2>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={24} /></button>
          </div>

          <div className="modal-body">
             <div className="form-group" style={{ marginBottom: '20px' }}>
                 <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500 }}>Tipo de Gráfico</label>
                 <div className="chart-type-selector" style={{ display: 'flex', gap: '8px', background: 'var(--bg-main)', padding: '4px', borderRadius: '8px' }}>
                     {['bar', 'line', 'pie'].map(t => (
                         <button 
                            key={t}
                            onClick={() => setType(t as any)}
                            style={{ 
                                flex: 1, 
                                textTransform: 'capitalize',
                                padding: '8px',
                                borderRadius: '6px',
                                border: 'none',
                                background: type === t ? 'var(--accent)' : 'transparent',
                                color: type === t ? 'white' : 'var(--text-secondary)',
                                cursor: 'pointer',
                                fontWeight: 500
                            }}
                         >
                            {t === 'bar' ? 'Barras' : t === 'line' ? 'Linhas' : 'Pizza'}
                         </button>
                     ))}
                 </div>
             </div>

             <div className="data-table" style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '8px' }}>
                 <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                     <thead style={{ background: 'var(--bg-main)' }}>
                         <tr>
                             <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontSize: '0.85rem' }}>Rótulo (Eixo X)</th>
                             <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontSize: '0.85rem' }}>Valor (Eixo Y)</th>
                             <th style={{ width: '40px', borderBottom: '1px solid var(--border)' }}></th>
                         </tr>
                     </thead>
                     <tbody>
                         {data.map((row, i) => (
                             <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                                 <td style={{ padding: '8px' }}>
                                     <input 
                                       type="text" 
                                       value={row.name} 
                                       onChange={(e) => handleUpdate(i, 'name', e.target.value)}
                                       style={{ width: '100%', padding: '6px', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text-primary)' }}
                                     />
                                 </td>
                                 <td style={{ padding: '8px' }}>
                                     <input 
                                       type="number" 
                                       value={row.value} 
                                       onChange={(e) => handleUpdate(i, 'value', Number(e.target.value))}
                                       style={{ width: '100%', padding: '6px', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text-primary)' }}
                                     />
                                 </td>
                                 <td style={{ textAlign: 'center' }}>
                                     <button onClick={() => handleRemove(i)} style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                                         <Trash2 size={16} />
                                     </button>
                                 </td>
                             </tr>
                         ))}
                     </tbody>
                 </table>
             </div>
             
             <button 
                onClick={handleAdd} 
                className="secondary-button" 
                style={{ 
                    marginTop: '12px', 
                    width: '100%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '8px',
                    padding: '8px',
                    border: '1px dashed var(--border)',
                    borderRadius: '8px',
                    background: 'transparent',
                    color: 'var(--accent)',
                    cursor: 'pointer'
                }}
             >
                 <Plus size={16} /> Adicionar Dados
             </button>

          </div>

          <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button 
                onClick={onClose} 
                style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: '1px solid var(--border)',
                    background: 'transparent',
                    color: 'var(--text-primary)',
                    cursor: 'pointer'
                }}
            >
                Cancelar
            </button>
            <button 
                onClick={() => { onSave(data, type); onClose(); }} 
                style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    background: 'var(--accent)',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}
            >
                 <Save size={18} /> 
                 Salvar Gráfico
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
