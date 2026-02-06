package com.estoque.controller;

import com.estoque.dto.ItemVendaDTO;
import com.estoque.dto.VendaDTO;
import com.estoque.model.ItemVenda;
import com.estoque.model.Produto;
import com.estoque.model.Usuario;
import com.estoque.model.Venda;
import com.estoque.repository.ItemVendaRepository;
import com.estoque.repository.ProdutoRepository;
import com.estoque.repository.VendaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/vendas")
public class VendaController {

    // --- INJEÇÕES QUE FALTAVAM (CORREÇÃO DO ERRO) ---
    @Autowired
    private VendaRepository vendaRepository;

    @Autowired
    private ProdutoRepository produtoRepository;

    @Autowired
    private ItemVendaRepository itemVendaRepository;

    // --- ENDPOINT DE FINALIZAR VENDA ---
    @PostMapping("/finalizar")
    public ResponseEntity<?> finalizarVenda(
            @RequestBody VendaDTO dados, 
            @AuthenticationPrincipal Usuario usuarioLogado) {

        if (dados.getItens() == null || dados.getItens().isEmpty()) {
            return ResponseEntity.badRequest().body("A venda precisa ter pelo menos um produto.");
        }

        Venda novaVenda = new Venda();
        novaVenda.setUsuario(usuarioLogado);
        novaVenda.setDataVenda(LocalDateTime.now());
        
        // Define Vendedor e Tipo (com valores padrão se vier vazio)
        novaVenda.setVendedor((dados.getVendedor() == null || dados.getVendedor().isEmpty()) ? "Venda Online" : dados.getVendedor());
        novaVenda.setTipoAtendimento(dados.getTipoAtendimento() == null ? "NA_LOJA" : dados.getTipoAtendimento());

        // Salva a venda primeiro para ter o ID
        novaVenda = vendaRepository.save(novaVenda);

        double valorTotal = 0.0;
        List<ItemVenda> itensParaSalvar = new ArrayList<>();

        for (ItemVendaDTO itemDto : dados.getItens()) {
            // Busca o produto no banco
            Produto produto = produtoRepository.findById(itemDto.getIdProduto())
                    .orElseThrow(() -> new RuntimeException("Produto não encontrado ID: " + itemDto.getIdProduto()));

            // Verifica Estoque
            if (produto.getQuantidade() < itemDto.getQuantidade()) {
                return ResponseEntity.badRequest().body("Estoque insuficiente para: " + produto.getNome());
            }

            // Baixa no Estoque
            produto.setQuantidade(produto.getQuantidade() - itemDto.getQuantidade());
            produtoRepository.save(produto);

            // Cria o Item da Venda
            ItemVenda item = new ItemVenda();
            item.setVenda(novaVenda);
            item.setProduto(produto);
            item.setQuantidade(itemDto.getQuantidade());
            item.setPrecoUnitario(produto.getPreco());
            item.setProdutoNome(produto.getNome()); // Grava o nome histórico

            itensParaSalvar.add(item);
            
            // Soma ao total
            valorTotal += (produto.getPreco() * itemDto.getQuantidade());
        }

        // Salva os itens todos de uma vez
        itemVendaRepository.saveAll(itensParaSalvar);
        
        // Atualiza o valor total da venda
        novaVenda.setValorTotal(valorTotal);
        vendaRepository.save(novaVenda);

        return ResponseEntity.ok("Venda realizada! Total: R$ " + valorTotal);
    }

    // --- ENDPOINT DE LISTAR (Dashboard) ---
    @GetMapping
    public ResponseEntity<List<Venda>> listarTodas() {
        return ResponseEntity.ok(vendaRepository.findAll());
    }
}