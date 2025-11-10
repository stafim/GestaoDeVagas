-- Script para popular funcionários por cliente e limites de profissão
-- Cria 10-20 funcionários por cliente e configura limites de vagas por profissão

-- Primeiro, criar profissões (caso não existam)
INSERT INTO professions (id, name, category, description, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'Motorista', 'Operacional', 'Motorista de veículos leves e pesados', true, NOW(), NOW()),
  (gen_random_uuid(), 'Auxiliar de Limpeza', 'Serviços Gerais', 'Limpeza e manutenção de ambientes', true, NOW(), NOW()),
  (gen_random_uuid(), 'Vigilante', 'Segurança', 'Vigilância patrimonial', true, NOW(), NOW()),
  (gen_random_uuid(), 'Auxiliar de Logística', 'Logística', 'Apoio em operações logísticas', true, NOW(), NOW()),
  (gen_random_uuid(), 'Operador de Empilhadeira', 'Operacional', 'Operação de empilhadeiras', true, NOW(), NOW()),
  (gen_random_uuid(), 'Mecânico', 'Manutenção', 'Manutenção mecânica', true, NOW(), NOW()),
  (gen_random_uuid(), 'Eletricista', 'Manutenção', 'Manutenção elétrica', true, NOW(), NOW()),
  (gen_random_uuid(), 'Desenvolvedor', 'Tecnologia', 'Desenvolvimento de software', true, NOW(), NOW()),
  (gen_random_uuid(), 'Analista de QA', 'Tecnologia', 'Qualidade de software', true, NOW(), NOW()),
  (gen_random_uuid(), 'Recepcionista', 'Administrativo', 'Atendimento e recepção', true, NOW(), NOW()),
  (gen_random_uuid(), 'Assistente Administrativo', 'Administrativo', 'Apoio administrativo', true, NOW(), NOW()),
  (gen_random_uuid(), 'Soldador', 'Industrial', 'Soldagem industrial', true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Função para gerar CPF formatado
CREATE OR REPLACE FUNCTION generate_cpf() RETURNS TEXT AS $$
BEGIN
  RETURN (100 + floor(random() * 900))::text || '.' ||
         (100 + floor(random() * 900))::text || '.' ||
         (100 + floor(random() * 900))::text || '-' ||
         (10 + floor(random() * 90))::text;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  -- Clientes
  v_clients RECORD;
  
  -- Empresas do Grupo
  v_companies RECORD;
  
  -- Profissões
  v_professions RECORD;
  
  -- Dados para geração
  first_names TEXT[] := ARRAY[
    'João', 'Maria', 'Pedro', 'Ana', 'Lucas', 'Juliana', 'Carlos', 'Fernanda',
    'Rafael', 'Camila', 'Bruno', 'Beatriz', 'Gabriel', 'Larissa', 'Felipe',
    'Amanda', 'Thiago', 'Gabriela', 'Rodrigo', 'Patrícia', 'Mateus', 'Mariana',
    'Diego', 'Aline', 'Guilherme', 'Renata', 'Fernando', 'Carolina', 'André',
    'Letícia', 'Henrique', 'Vanessa', 'Leonardo', 'Tatiana', 'Vinícius',
    'Débora', 'Marcelo', 'Priscila', 'Ricardo', 'Cristina', 'Paulo', 'Simone',
    'Fábio', 'Mônica', 'Gustavo', 'Cláudia', 'Márcio', 'Luciana', 'Roberto',
    'Sandra', 'Sérgio', 'Silvia', 'Antônio', 'Teresa', 'José', 'Vera',
    'Francisco', 'Cristiane', 'Marcos', 'Alessandra', 'Luiz', 'Carla'
  ];
  
  last_names TEXT[] := ARRAY[
    'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves',
    'Pereira', 'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Martins', 'Carvalho',
    'Rocha', 'Almeida', 'Nascimento', 'Araújo', 'Melo', 'Barbosa', 'Cardoso',
    'Correia', 'Dias', 'Teixeira', 'Mendes', 'Moreira', 'Cavalcanti', 'Monteiro',
    'Freitas', 'Campos', 'Ramos', 'Pinto', 'Medeiros', 'Farias', 'Castro'
  ];
  
  departments TEXT[] := ARRAY[
    'Operações', 'Administrativo', 'Recursos Humanos', 'Financeiro',
    'Manutenção', 'Logística', 'TI', 'Comercial', 'Compras'
  ];
  
  positions TEXT[] := ARRAY[
    'Auxiliar', 'Assistente', 'Analista Jr', 'Analista Pleno', 'Analista Sr',
    'Coordenador', 'Supervisor', 'Gerente', 'Operador', 'Técnico'
  ];
  
  v_employee_count INT;
  v_first_name TEXT;
  v_last_name TEXT;
  v_full_name TEXT;
  v_department TEXT;
  v_position TEXT;
  v_employee_code TEXT;
  i INT;
  v_code_counter INT := 1;
  
  -- Para limites de profissão
  v_max_jobs INT;
BEGIN
  RAISE NOTICE '=== Iniciando população de funcionários e limites de profissão ===';
  
  -- Para cada cliente
  FOR v_clients IN SELECT id, name FROM clients ORDER BY name
  LOOP
    RAISE NOTICE 'Processando cliente: %', v_clients.name;
    
    -- Buscar empresas associadas ao cliente (através de jobs)
    -- Usaremos as empresas das vagas para distribuir funcionários
    FOR v_companies IN 
      SELECT DISTINCT c.id, c.name 
      FROM companies c
      INNER JOIN jobs j ON j.company_id = c.id
      WHERE EXISTS (
        SELECT 1 FROM jobs WHERE company_id = c.id
      )
      ORDER BY c.name
      LIMIT 5 -- Limitar a 5 empresas por cliente
    LOOP
      -- Determinar quantos funcionários criar para esta empresa (10-20)
      v_employee_count := 10 + floor(random() * 11)::INT;
      
      RAISE NOTICE '  Criando % funcionários para empresa: %', v_employee_count, v_companies.name;
      
      FOR i IN 1..v_employee_count
      LOOP
        -- Gerar dados do funcionário
        v_first_name := first_names[1 + floor(random() * array_length(first_names, 1))::INT];
        v_last_name := last_names[1 + floor(random() * array_length(last_names, 1))::INT];
        v_full_name := v_first_name || ' ' || v_last_name;
        
        v_department := departments[1 + floor(random() * array_length(departments, 1))::INT];
        v_position := positions[1 + floor(random() * array_length(positions, 1))::INT];
        
        -- Código do funcionário (formato: CLI-NNNN)
        v_employee_code := 'FUN-' || LPAD(v_code_counter::TEXT, 5, '0');
        v_code_counter := v_code_counter + 1;
        
        -- Inserir funcionário
        INSERT INTO employees (
          id, employee_code, name, company_id, department, position,
          is_active, created_at, updated_at
        ) VALUES (
          gen_random_uuid(),
          v_employee_code,
          v_full_name,
          v_companies.id,
          v_department,
          v_position,
          true,
          NOW(),
          NOW()
        );
      END LOOP;
    END LOOP;
    
    -- Popular client_profession_limits para este cliente
    -- Dar limites variados por profissão
    FOR v_professions IN SELECT id, name, category FROM professions WHERE is_active = true
    LOOP
      -- Definir max_jobs baseado na categoria da profissão
      CASE 
        WHEN v_professions.category IN ('Operacional', 'Serviços Gerais', 'Segurança') THEN
          v_max_jobs := 15 + floor(random() * 16)::INT; -- 15-30 vagas
        WHEN v_professions.category IN ('Logística', 'Manutenção') THEN
          v_max_jobs := 10 + floor(random() * 11)::INT; -- 10-20 vagas
        WHEN v_professions.category IN ('Administrativo', 'Industrial') THEN
          v_max_jobs := 8 + floor(random() * 8)::INT; -- 8-15 vagas
        WHEN v_professions.category IN ('Tecnologia') THEN
          v_max_jobs := 5 + floor(random() * 6)::INT; -- 5-10 vagas
        ELSE
          v_max_jobs := 10; -- Padrão
      END CASE;
      
      -- Inserir limite
      INSERT INTO client_profession_limits (
        id, client_id, profession_id, max_jobs, created_at, updated_at
      ) VALUES (
        gen_random_uuid(),
        v_clients.id,
        v_professions.id,
        v_max_jobs,
        NOW(),
        NOW()
      );
    END LOOP;
    
    RAISE NOTICE '  Limites de profissão configurados para %', v_clients.name;
  END LOOP;
  
  RAISE NOTICE '=== População concluída com sucesso! ===';
  RAISE NOTICE 'Total de funcionários criados: %', (SELECT COUNT(*) FROM employees);
  RAISE NOTICE 'Total de limites de profissão: %', (SELECT COUNT(*) FROM client_profession_limits);
END $$;

-- Limpar função auxiliar
DROP FUNCTION IF EXISTS generate_cpf();

-- Mostrar resumo
SELECT 
  c.name as cliente,
  COUNT(DISTINCT e.id) as funcionarios,
  COUNT(DISTINCT cpl.id) as limites_profissao
FROM clients c
LEFT JOIN companies comp ON EXISTS (SELECT 1 FROM jobs WHERE company_id = comp.id)
LEFT JOIN employees e ON e.company_id = comp.id
LEFT JOIN client_profession_limits cpl ON cpl.client_id = c.id
GROUP BY c.id, c.name
ORDER BY c.name;
