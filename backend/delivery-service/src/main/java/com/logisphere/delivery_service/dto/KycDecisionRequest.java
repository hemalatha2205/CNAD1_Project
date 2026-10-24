package com.logisphere.delivery_service.dto;

import com.logisphere.delivery_service.entity.VerificationStatus;

public class KycDecisionRequest {

    private VerificationStatus status;
    private String reason;
    private String notes;

    public KycDecisionRequest() {}

    public VerificationStatus getStatus() {
        return status;
    }

    public void setStatus(VerificationStatus status) {
        this.status = status;
    }

    public VerificationStatus getDecision() {
        return status;
    }

    public void setDecision(VerificationStatus decision) {
        if (this.status == null) {
            this.status = decision;
        }
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
