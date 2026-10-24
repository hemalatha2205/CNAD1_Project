package com.logisphere.auth_service.dto;

public class DeactivateAccountRequest {
    private String password;
    private String confirmationText;

    public DeactivateAccountRequest() {}

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getConfirmationText() {
        return confirmationText;
    }

    public void setConfirmationText(String confirmationText) {
        this.confirmationText = confirmationText;
    }

    public void setConfirmation(String confirmation) {
        this.confirmationText = confirmation;
    }

    public String getConfirmation() {
        return confirmationText;
    }
}
