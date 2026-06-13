import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, FileCheck, Users, AlertTriangle, Server } from "lucide-react";

export default function SecurityPage() {
  return (
    <>
      <Header />
      <main>
        <section className="py-20 border-b border-border/50">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4 border-amber-200 text-amber-700">Trust & Security</Badge>
              <h1 className="text-4xl font-bold mb-4">Your Contracts Are Secure</h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                We treat your contracts with the same confidentiality as a law firm.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6 border-border/50">
                <div className="flex items-center gap-3 mb-3">
                  <Lock className="h-5 w-5 text-amber-600" />
                  <h3 className="font-semibold">Encryption at Rest & In Transit</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  All uploaded contracts are encrypted using AES-256 at rest and TLS 1.3 in transit. 
                  Files are stored in isolated, access-controlled storage.
                </p>
              </Card>

              <Card className="p-6 border-border/50">
                <div className="flex items-center gap-3 mb-3">
                  <Users className="h-5 w-5 text-amber-600" />
                  <h3 className="font-semibold">Role-Based Access Control</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Granular access controls ensure only authorized team members can view, review, or manage contracts.
                  Organization-level isolation is enforced at the database level.
                </p>
              </Card>

              <Card className="p-6 border-border/50">
                <div className="flex items-center gap-3 mb-3">
                  <FileCheck className="h-5 w-5 text-amber-600" />
                  <h3 className="font-semibold">Audit Logs</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Every action — upload, review, export — is logged with timestamps and user identity. 
                  Full traceability for compliance and internal governance.
                </p>
              </Card>

              <Card className="p-6 border-border/50">
                <div className="flex items-center gap-3 mb-3">
                  <Server className="h-5 w-5 text-amber-600" />
                  <h3 className="font-semibold">Data Residency</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Data is hosted in Indian data centers. Compliant with DPDP Act 2023 data localization requirements.
                  Contracts are never stored outside India.
                </p>
              </Card>
            </div>

            <Card className="mt-8 p-6 border-amber-200/50 bg-amber-50/20 dark:bg-amber-950/10">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-2">Important Notice</h3>
                  <p className="text-sm text-muted-foreground">
                    ClauseGuard India is an AI-assisted contract review tool. It is not a substitute for 
                    professional legal advice. All AI-generated suggestions should be reviewed by a qualified 
                    legal professional before being relied upon. We make no warranties regarding the accuracy, 
                    completeness, or legal sufficiency of AI-generated outputs.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
