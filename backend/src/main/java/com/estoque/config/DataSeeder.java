package com.estoque.config;

import com.estoque.model.Usuario;
import com.estoque.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        
        // --- CORREÇÃO: BUSCAR O USUÁRIO NO BANCO PRIMEIRO ---
        // O cast (Usuario) é necessário porque seu repositório retorna UserDetails
        Usuario cliente = (Usuario) usuarioRepository.findByEmail("cliente@gmail.com");

        if (cliente == null) {
            cliente = new Usuario();
            cliente.setEmail("cliente@gmail.com");
            cliente.setAdmin(false);
            cliente.setCpf("111.111.111-11");
        }
        
        // Atualiza a senha
        cliente.setSenha(passwordEncoder.encode("123456"));
        usuarioRepository.save(cliente);


        // --- MESMA COISA PARA O ADMIN ---
        Usuario admin = (Usuario) usuarioRepository.findByEmail("admin@estoque.com");

        if (admin == null) {
            admin = new Usuario();
            admin.setEmail("admin@estoque.com");
            admin.setAdmin(true);
            admin.setCpf("000.000.000-00");
        }
        
        admin.setSenha(passwordEncoder.encode("123456"));
        usuarioRepository.save(admin);

        System.out.println("✅ SENHAS ATUALIZADAS E CRIPTOGRAFADAS COM SUCESSO!");
    }
}