package com.estoque.controller;

import com.estoque.dto.ItemVendaDTO;
import com.estoque.dto.VendaDTO;
import com.estoque.model.ItemVenda;
import com.estoque.model.Produto;
import com.estoque.model.Usuario;
import com.estoque.model.Venda;
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

    @Autowired
    private VendaRepository vendaRepository;

    @Autowired
    private ProdutoRepository produtoRepository;

    // Endpoint para finalizar a venda
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
        
        // Define Vendedor e Tipo
        novaVenda.setVendedor((dados.getVendedor() == null || dados.getVendedor().isEmpty()) ? "Venda Online" : dados.getVendedor());
        novaVenda.setTipoAtendimento(dados.getTipoAtendimento() == null ? "NA_LOJA" : dados.getTipoAtendimento());

        double valorTotal = 0.0;
        List<ItemVenda> listaItens = new ArrayList<>();

        // Processa cada item do carrinho
        for (ItemVendaDTO itemDto : dados.getItens()) {
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
            item.setVenda(novaVenda); // Liga o item à venda
            item.setProduto(produto);
            item.setQuantidade(itemDto.getQuantidade());
            item.setPrecoUnitario(produto.getPreco());
            item.setProdutoNome(produto.getNome()); // Grava o nome histórico

            listaItens.add(item);
            
            // Soma ao total
            valorTotal += (produto.getPreco() * itemDto.getQuantidade());
        }

        // --- CORREÇÃO PRINCIPAL AQUI ---
        // Adicionamos a lista preenchida na Venda ANTES de salvar
        novaVenda.setItens(listaItens);
        novaVenda.setValorTotal(valorTotal);
        
        // Salvamos apenas a Venda. O "Cascade" vai salvar os Itens automaticamente.
        vendaRepository.save(novaVenda);

        return ResponseEntity.ok("Venda realizada com sucesso! Total: R$ " + valorTotal);
    }

    // Endpoint de Listagem
    @GetMapping
    public ResponseEntity<List<Venda>> listarTodas() {
        // O fetch = FetchType.EAGER na entidade Venda garante que os itens venham junto
        return ResponseEntity.ok(vendaRepository.findAll());
    }

    @PutMapping("/{id}/atribuir-equipe")
    public ResponseEntity<?> atribuirEquipe(@PathVariable Long id, @RequestBody java.util.Map<String, String> payload) {
        String nomesEquipe = payload.get("equipe"); // O Front vai mandar um JSON: { "equipe": "João, Maria" }
        
        return vendaRepository.findById(id).map(venda -> {
            venda.setVendedor(nomesEquipe);
            vendaRepository.save(venda);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}