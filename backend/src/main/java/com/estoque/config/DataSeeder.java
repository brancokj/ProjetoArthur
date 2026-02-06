package com.estoque.config;

import com.estoque.model.Produto; // Certifique-se que existe essa classe
import com.estoque.model.Usuario;
import com.estoque.repository.ProdutoRepository; // Certifique-se que existe esse repositório
import com.estoque.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Arrays;

@Configuration
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private ProdutoRepository produtoRepository; // <--- INJETAR REPOSITÓRIO DE PRODUTOS

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        
        // --- 1. SEED DE USUÁRIOS (Mantenha o que já funcionava) ---
        if (usuarioRepository.findByEmail("cliente@gmail.com") == null) {
            Usuario cliente = new Usuario();
            cliente.setNome("Cliente Padrão");
            cliente.setEmail("cliente@gmail.com");
            cliente.setCpf("111.111.111-11");
            cliente.setEndereco("Rua dos Clientes, 100");
            cliente.setCep("12345678");
            cliente.setAdmin(false);
            cliente.setSenha(passwordEncoder.encode("123456"));
            usuarioRepository.save(cliente);
            System.out.println("✅ Usuário Cliente criado.");
        }

        if (usuarioRepository.findByEmail("admin@estoque.com") == null) {
            Usuario admin = new Usuario();
            admin.setNome("Administrador Master");
            admin.setEmail("admin@estoque.com");
            admin.setCpf("000.000.000-00");
            admin.setEndereco("Centro de Distribuição");
            admin.setCep("87654321");
            admin.setAdmin(true);
            admin.setSenha(passwordEncoder.encode("123456"));
            usuarioRepository.save(admin);
            System.out.println("✅ Usuário Admin criado.");
        }

        // --- 2. SEED DE PRODUTOS (NOVO!) ---
        // Só cria se a tabela estiver vazia para não duplicar
        if (produtoRepository.count() == 0) {
            
            Produto p1 = new Produto();
            p1.setNome("Notebook Gamer Dell G15");
            p1.setDescricao("Notebook potente com RTX 3050 e 16GB RAM");
            p1.setPreco(4500.00);
            p1.setQuantidade(10); // Estoque
            // p1.setImagemUrl("https://exemplo.com/notebook.jpg"); // Se tiver campo imagem

            Produto p2 = new Produto();
            p2.setNome("Mouse Sem Fio Logitech");
            p2.setDescricao("Mouse ergonômico silencioso");
            p2.setPreco(120.50);
            p2.setQuantidade(50);

            Produto p3 = new Produto();
            p3.setNome("Monitor LG Ultrawide 29\"");
            p3.setDescricao("Monitor Full HD ideal para multitarefas");
            p3.setPreco(1200.00);
            p3.setQuantidade(5);

            Produto p4 = new Produto();
            p4.setNome("Teclado Mecânico RGB");
            p4.setDescricao("Teclado switch blue com iluminação");
            p4.setPreco(250.00);
            p4.setQuantidade(20);

            Produto p5 = new Produto();
            p5.setNome("Cadeira Gamer ThunderX3");
            p5.setDescricao("Cadeira confortável com ajuste de lombar");
            p5.setPreco(1800.00);
            p5.setQuantidade(8);

            // Salva todos de uma vez
            produtoRepository.saveAll(Arrays.asList(p1, p2, p3, p4, p5));
            
            System.out.println("✅ 5 Produtos de teste cadastrados!");
        } else {
            System.out.println("ℹ️ Produtos já existem no banco. Pulando criação.");
        }
    }
}