package com.estoque.dto;

public class RegisterDTO {
    private String email;
    private String password;
    private String documento;

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getDocumento() { return documento; }
    public void setDocumento(String documento) { this.documento = documento; }
}