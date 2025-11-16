import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { volunteersAPI, studentsAPI, treesAPI, smsAPI } from '@/lib/api';
import { Users, MessageSquare, UserPlus, Phone, GraduationCap, TreePine, Activity } from 'lucide-react';

const Dashboard = () => {
  const { data: volunteers = [] } = useQuery({
    queryKey: ['volunteers'],
    queryFn: () => volunteersAPI.getAll(),
  });

  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: () => studentsAPI.getAll(),
  });

  const { data: trees = [] } = useQuery({
    queryKey: ['trees'],
    queryFn: () => treesAPI.getAll(),
  });

  const { data: smsHistory = [] } = useQuery({
    queryKey: ['sms-history'],
    queryFn: () => smsAPI.getHistory(undefined, 10),
  });

  const stats = {
    totalVolunteers: volunteers.length,
    totalStudents: students.length,
    totalTrees: trees.length,
    pairedStudents: students.filter((s: any) => s.volunteer_id).length,
    welcomeSmsSent: volunteers.filter((v: any) => v.welcome_sms_sent).length,
    totalSmsSent: smsHistory.filter((s: any) => s.status === 'sent').length,
    pendingSms: smsHistory.filter((s: any) => s.status === 'pending').length,
    growingTrees: trees.filter((t: any) => t.status === 'growing').length,
    plantedTrees: trees.filter((t: any) => t.status === 'planted').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Dashboard</h2>
        <p className="text-muted-foreground">Sistem özeti ve istatistikler</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Öğrenci</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Kayıtlı öğrenci sayısı
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Ağaç</CardTitle>
            <TreePine className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTrees}</div>
            <p className="text-xs text-muted-foreground">
              Dikilen ağaç sayısı
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eşleştirilmiş Öğrenci</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pairedStudents}</div>
            <p className="text-xs text-muted-foreground">
              Gönüllü ile eşleştirilen
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Büyüyen Ağaçlar</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.growingTrees}</div>
            <p className="text-xs text-muted-foreground">
              Aktif büyüyen ağaçlar
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Gönüllü</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVolunteers}</div>
            <p className="text-xs text-muted-foreground">
              Kayıtlı gönüllü sayısı
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gönderilen SMS</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSmsSent}</div>
            <p className="text-xs text-muted-foreground">
              Toplam gönderilen SMS
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dikilen Ağaçlar</CardTitle>
            <TreePine className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.plantedTrees}</div>
            <p className="text-xs text-muted-foreground">
              Yeni dikilen ağaçlar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bekleyen SMS</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingSms}</div>
            <p className="text-xs text-muted-foreground">
              Gönderilmeyi bekleyen SMS
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Son Öğrenciler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {students.slice(0, 5).map((student: any) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-2 rounded border"
                >
                  <div>
                    <p className="font-medium">
                      {student.first_name} {student.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {student.class_name || '-'} | {student.volunteer_first_name ? `${student.volunteer_first_name} ile eşleştirildi` : 'Gönüllü bekliyor'}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(student.created_at).toLocaleDateString('tr-TR')}
                  </div>
                </div>
              ))}
              {students.length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  Henüz öğrenci kaydı yok
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Son Ağaçlar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {trees.slice(0, 5).map((tree: any) => (
                <div
                  key={tree.id}
                  className="flex items-center justify-between p-2 rounded border"
                >
                  <div>
                    <p className="font-medium">{tree.tree_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {tree.student_first_name} & {tree.volunteer_first_name}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {tree.planting_date ? new Date(tree.planting_date).toLocaleDateString('tr-TR') : '-'}
                  </div>
                </div>
              ))}
              {trees.length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  Henüz ağaç kaydı yok
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Son Gönüllüler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {volunteers.slice(0, 5).map((volunteer: any) => (
                <div
                  key={volunteer.id}
                  className="flex items-center justify-between p-2 rounded border"
                >
                  <div>
                    <p className="font-medium">
                      {volunteer.first_name} {volunteer.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">{volunteer.phone}</p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(volunteer.created_at).toLocaleDateString('tr-TR')}
                  </div>
                </div>
              ))}
              {volunteers.length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  Henüz gönüllü kaydı yok
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <Card>
          <CardHeader>
            <CardTitle>Son SMS Mesajları</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {smsHistory.slice(0, 5).map((sms: any) => (
                <div
                  key={sms.id}
                  className="flex items-center justify-between p-2 rounded border"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{sms.message}</p>
                    <p className="text-xs text-muted-foreground">{sms.phone}</p>
                  </div>
                  <div className="ml-2">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        sms.status === 'sent'
                          ? 'bg-green-100 text-green-800'
                          : sms.status === 'failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {sms.status === 'sent'
                        ? 'Gönderildi'
                        : sms.status === 'failed'
                        ? 'Başarısız'
                        : 'Bekliyor'}
                    </span>
                  </div>
                </div>
              ))}
              {smsHistory.length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  Henüz SMS gönderilmemiş
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

