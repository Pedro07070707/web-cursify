# Regras do Projeto CursiFy

## Banco de Dados — Status: NÃO DISPONÍVEL

O banco de dados do projeto ainda não está disponível. As seguintes regras se aplicam a TODAS as sessões e chats:

### O que NÃO fazer
- Não criar, configurar, alterar ou simular conexão real com banco de dados
- Não inventar tabelas, registros, IDs ou dados persistentes para fazer uma funcionalidade funcionar
- Não remover nem desfazer funcionalidades já implementadas por causa da ausência do banco

### O que fazer
- Continuar o desenvolvimento do front-end e back-end nas partes que NÃO dependem diretamente do banco
- Quando uma parte depender do banco: implementar toda a estrutura possível e deixar como placeholder claramente identificado
- Manter o código preparado para receber a integração posteriormente

### Como registrar dependências do banco no código
Sempre que houver dependência do banco, registrar no código exatamente:
- O que ficou pendente
- Quais dados serão necessários
- Onde a integração deverá ser feita
- O que já foi implementado

Usar o seguinte padrão de comentário:
```java
// TODO [DB_PENDING]: <o que ficou pendente>
// DADOS NECESSÁRIOS: <quais dados/tabelas/campos>
// INTEGRAÇÃO: <onde e como conectar quando o banco estiver disponível>
// JÁ IMPLEMENTADO: <o que já está pronto>
```

```js
// TODO [DB_PENDING]: <o que ficou pendente>
// DADOS NECESSÁRIOS: <quais dados/campos>
// INTEGRAÇÃO: substituir este placeholder pela chamada real à api.<método>
// JÁ IMPLEMENTADO: <estrutura, estado, UI já prontos>
```

### Antes de finalizar cada alteração
Verificar se ela realmente depende do banco. Caso não dependa, implementar normalmente sem placeholder.

### Quando o banco estiver disponível
Buscar todos os comentários `TODO [DB_PENDING]` no projeto para localizar exatamente onde retomar e substituir os placeholders pela implementação real, sem precisar refazer o trabalho já feito.
