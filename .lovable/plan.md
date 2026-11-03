# Trocar o nome "AfiliaPlace" por "LucroLink"

## O que muda para você
- Todo lugar onde aparece **AfiliaPlace** passa a mostrar **LucroLink**: página inicial, login, painel, lojas públicas, páginas de influenciadores, termos, privacidade, e-mails enviados aos clientes, título da aba do navegador e nome do app quando instalado no celular.
- O logotipo em texto e as artes de divulgação também passam a usar o novo nome.

## O que NÃO muda
- Links já compartilhados, cupons, contas, assinaturas e dados continuam iguais.
- Cores e visual do site ficam como estão.
- Se existir alguma imagem de logo com "AfiliaPlace" escrito dentro dela (ou o vídeo da página inicial), ela não muda sozinha. Eu aviso se encontrar uma.

## Detalhes técnicos
- Substituir "AfiliaPlace"/"Afiliaplace"/"afiliaplace" nos textos exibidos em cerca de 50 arquivos (rotas, componentes, modelos de e-mail, manifest, head/SEO, share-art, divulgacao-core).
- Manter nomes internos (nomes de arquivos de assets, chaves de armazenamento, identificadores) sem mudar, para não quebrar nada.
- Atualizar o teste de divulgação que confere o nome e rodar os testes.
- Salvar o novo nome na memória do projeto.
