import { AuditTrailRepository } from "@/repositories/AuditTrailRepository";

export class auditTrailController {
  private auditTrailRepository: AuditTrailRepository;

  constructor(auditTrailRepository: AuditTrailRepository) {
    this.auditTrailRepository = auditTrailRepository;
  }

  public createAudit = async (req, res) => {
    try {
      const { action, section, device_info, changes_json } = req.body;
      const form_id = req.params.form_id;

      const performed_by = (req as any).user?.sub || "unknown";
      const ip_address =
        req.headers["x-forwarded-for"] || req.socket.remoteAddress;

      const audit = await this.auditTrailRepository.createAuditTrail({
        form_id,
        action,
        section,
        device_info,
        changes_json,
        performed_by,
        ip_address: String(ip_address),
      });
      console.log(audit);
      return res.status(201).json({
        success: true,
        message: "Audit trail created successfully",
        data: audit,
      });
    } catch (error) {
      console.error("Error creating audit trail:", error);
      return res.status(500).json({ error: "Failed to create audit trail" });
    }
  };
}
