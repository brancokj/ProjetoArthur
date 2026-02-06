package com.estoque.service;

import com.estoque.dto.ViaCepResponseDTO;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class ViaCepService {

    public ViaCepResponseDTO consultarCep(String cep) {
        // Limpa o CEP (tira traço, ponto, etc)
        String cepLimpo = cep.replaceAll("[^0-9]", "");

        if (cepLimpo.length() != 8) {
            return null; // Nem tenta buscar se não tiver 8 dígitos
        }

        RestTemplate restTemplate = new RestTemplate();
        String url = "https://viacep.com.br/ws/" + cepLimpo + "/json/";

        try {
            // Faz a requisição HTTP (GET) para o ViaCEP
            return restTemplate.getForObject(url, ViaCepResponseDTO.class);
        } catch (Exception e) {
            // Se der erro de conexão ou o site estiver fora do ar
            return null;
        }
    }
}