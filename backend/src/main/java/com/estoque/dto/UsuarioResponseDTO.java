package com.estoque.dto;

import com.estoque.model.Usuario;

// Adicionei: nome, telefone, endereco, cep
public record UsuarioResponseDTO(
    Long id, 
    String nome, 
    String email, 
    String telefone, 
    String cpf, 
    String cnpj, 
    String endereco, 
    String cep, 
    boolean admin
) {
    public UsuarioResponseDTO(Usuario usuario) {
        this(
            usuario.getId(), 
            usuario.getNome(), 
            usuario.getEmail(), 
            usuario.getTelefone(), 
            usuario.getCpf(), 
            usuario.getCnpj(),
            usuario.getEndereco(), // <--- Agora enviamos o endereço
            usuario.getCep(),      // <--- E o CEP
            usuario.isAdmin()
        );
    }
}