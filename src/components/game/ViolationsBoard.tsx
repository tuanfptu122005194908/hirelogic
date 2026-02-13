import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertTriangle, Shield, RefreshCw } from 'lucide-react';
import { globalViolationCounter } from '@/hooks/useAntiCheat';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ViolationsBoardProps {
  onBack: () => void;
}

const getViolationTypeLabel = (type: string) => {
  switch (type) {
    case 'EXIT_FULLSCREEN':
      return '❌ Thoát fullscreen';
    case 'TAB_SWITCH':
      return '🔄 Chuyển tab';
    case 'WINDOW_BLUR':
      return '👁️ Mất focus';
    case 'EXIT_TO_MAIN':
      return '🚪 Thoát về màn hình chính';
    default:
      return type;
  }
};

export const ViolationsBoard = ({ onBack }: ViolationsBoardProps) => {
  const [totalViolations, setTotalViolations] = useState(0);
  const [violationsByType, setViolationsByType] = useState<[string, number][]>([]);

  const loadViolations = () => {
    setTotalViolations(globalViolationCounter.getTotal());
    setViolationsByType(Array.from(globalViolationCounter.byType.entries()));
  };

  useEffect(() => {
    loadViolations();
    const interval = setInterval(loadViolations, 3000);
    return () => clearInterval(interval);
  }, []);

  const isDisqualified = totalViolations >= 5;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="container mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={onBack} className="hover:bg-muted">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  <Shield className="w-8 h-8 text-primary" />
                  Vi Phạm Của Bạn
                </h1>
                <p className="text-muted-foreground mt-1">
                  Tổng số vi phạm trong thử thách
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={loadViolations} className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Làm mới
            </Button>
          </div>
        </motion.div>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-6"
        >
          <Card className={`border-2 ${isDisqualified ? 'border-destructive' : totalViolations > 0 ? 'border-orange-500/50' : 'border-primary/20'}`}>
            <CardContent className="pt-6 text-center">
              <div className="text-5xl font-black mb-2">
                {totalViolations} / 5
              </div>
              {isDisqualified ? (
                <Badge variant="destructive" className="text-lg px-4 py-1">
                  🚫 Bị loại khỏi thử thách
                </Badge>
              ) : totalViolations > 0 ? (
                <Badge variant="secondary" className="text-lg px-4 py-1 bg-orange-500/20 text-orange-700 border-orange-500/30">
                  ⚠️ Còn {5 - totalViolations} lần trước khi bị loại
                </Badge>
              ) : (
                <Badge variant="outline" className="text-lg px-4 py-1 bg-green-500/10 text-green-600 border-green-500/30">
                  <Shield className="w-4 h-4 mr-1" /> Chưa có vi phạm
                </Badge>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Violations by type */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass-card-strong">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Chi Tiết Vi Phạm
              </CardTitle>
            </CardHeader>
            <CardContent>
              {violationsByType.length === 0 ? (
                <div className="text-center py-8">
                  <Shield className="w-12 h-12 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-muted-foreground">Chưa có vi phạm nào</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Loại vi phạm</TableHead>
                      <TableHead className="text-center">Số lần</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {violationsByType.map(([type, count]) => (
                      <TableRow key={type}>
                        <TableCell className="font-medium">
                          {getViolationTypeLabel(type)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary" className={count >= 2 ? 'bg-destructive/20 text-destructive' : ''}>
                            {count}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6"
        >
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="space-y-2 text-sm">
                <p className="font-semibold">📌 Quy tắc vi phạm:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>Thoát fullscreen = 1 vi phạm</li>
                  <li>Chuyển tab / Mất focus = 1 vi phạm</li>
                  <li>Vi phạm ≥ 5 lần = Bị loại vĩnh viễn khỏi thử thách</li>
                  <li>Vi phạm được lưu cục bộ trên trình duyệt</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
