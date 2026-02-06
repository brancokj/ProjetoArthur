package com.estoque.dto;

public class RegisterDTO {
    private String nome;
    private String cep;
    private String numero;       
    private String complemento;  
    private String email;
    private String password;
    private String documento;

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getCep() { return cep; }
    public void setCep(String cep) { this.cep = cep; }

    public String getNumero() { return numero; }
    public void setNumero(String numero) { this.numero = numero; }

    public String getComplemento() { return complemento; }
    public void setComplemento(String complemento) { this.complemento = complemento; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getDocumento() { return documento; }
    public void setDocumento(String documento) { this.documento = documento; }
}