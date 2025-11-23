import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  age: number | null;
  blood_group: string | null;
}

export default function ViewPatients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const { data: patientRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'patient');

      if (rolesError) throw rolesError;

      const patientIds = patientRoles.map(r => r.user_id);

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, email, phone')
        .in('id', patientIds);

      if (profilesError) throw profilesError;

      const { data: patientsInfo, error: infoError } = await supabase
        .from('patients_info')
        .select('user_id, age, blood_group')
        .in('user_id', patientIds);

      if (infoError) throw infoError;

      const patientsWithInfo = profiles.map(profile => {
        const info = patientsInfo.find(pi => pi.user_id === profile.id);
        return {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          age: info?.age || null,
          blood_group: info?.blood_group || null,
        };
      });

      setPatients(patientsWithInfo);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">All Patients</h1>
          <p className="text-muted-foreground mt-2">View all registered patients</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Patient List ({patients.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : patients.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No patients found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Blood Group</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell className="font-medium">{patient.name}</TableCell>
                      <TableCell>{patient.email}</TableCell>
                      <TableCell>{patient.phone || 'N/A'}</TableCell>
                      <TableCell>{patient.age || 'N/A'}</TableCell>
                      <TableCell>{patient.blood_group || 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}