-- Script para popular banco com candidatos de teste
-- Distribuídos aleatoriamente pelos estágios do Kanban

-- Função auxiliar para gerar CPF no formato
CREATE OR REPLACE FUNCTION generate_cpf() RETURNS TEXT AS $$
BEGIN
  RETURN (100 + floor(random() * 900))::text || '.' ||
         (100 + floor(random() * 900))::text || '.' ||
         (100 + floor(random() * 900))::text || '-' ||
         (10 + floor(random() * 90))::text;
END;
$$ LANGUAGE plpgsql;

-- Inserir candidatos de teste
DO $$
DECLARE
  job_ids TEXT[] := ARRAY[
    'b4987648-84e2-4969-8b72-f945b0253b9c', -- LOC-001 Motorista
    '547e07d5-e312-4ae9-9a0b-051a4fb64f70', -- BOT-001 Auxiliar Limpeza
    '0a860bd0-8053-420f-b127-9c8c9f1c7544', -- AIT-002 Analista QA
    'dbf43c7d-f806-47db-bafb-cbf643c74f20', -- STE-001 Mecânico
    '29437b2e-a7d9-47fa-85ba-ab3b6d161928', -- AIT-001 Dev Full Stack
    'c1e2f5e4-cea8-4c15-9054-0679c1dea1df', -- VOL-001 Operador Empilhadeira
    'c1fb5be4-07e1-44b3-b6a4-15831cfe3100', -- BOT-002 Vigilante
    'ab2b4d98-0be6-4a0e-8a81-701f50413509'  -- LOC-002 Auxiliar Logística
  ];
  
  stage_ids TEXT[] := ARRAY[
    'bc1ff9ab-1e81-4d27-872e-0a8c4100a2eb', -- Triagem Inicial
    '1597adaa-e54a-4d05-9473-9e5fdde2fa3c', -- Entrevista RH
    'ec56eab6-e340-4ec5-88e7-70c3261588b0', -- Teste Técnico
    '39ff972f-d454-40f0-8bc3-e8fd2c5bbe49', -- Entrevista Gestor
    '43ff0223-d41c-43da-a858-e96f45f9650f', -- Proposta
    'e94ae5e5-e59c-4f34-bade-516d47d62087', -- Contratado
    'de1f965c-9d1e-4fc7-988c-c4f805e4a03c'  -- Recusado
  ];
  
  first_names TEXT[] := ARRAY[
    'João', 'Maria', 'Pedro', 'Ana', 'Lucas', 'Juliana', 'Carlos', 'Fernanda',
    'Rafael', 'Camila', 'Bruno', 'Beatriz', 'Gabriel', 'Larissa', 'Felipe',
    'Amanda', 'Thiago', 'Gabriela', 'Rodrigo', 'Patrícia', 'Mateus', 'Mariana',
    'Diego', 'Aline', 'Guilherme', 'Renata', 'Fernando', 'Carolina', 'André',
    'Letícia', 'Henrique', 'Vanessa', 'Leonardo', 'Tatiana', 'Vinícius',
    'Débora', 'Marcelo', 'Priscila', 'Ricardo', 'Cristina', 'Paulo', 'Simone',
    'Fábio', 'Mônica', 'Gustavo', 'Cláudia', 'Márcio', 'Luciana', 'Roberto',
    'Sandra'
  ];
  
  last_names TEXT[] := ARRAY[
    'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves',
    'Pereira', 'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Martins', 'Carvalho',
    'Rocha', 'Almeida', 'Nascimento', 'Araújo', 'Melo', 'Barbosa', 'Cardoso',
    'Correia', 'Dias', 'Teixeira', 'Mendes', 'Moreira', 'Cavalcanti', 'Monteiro',
    'Freitas', 'Campos'
  ];
  
  cities TEXT[] := ARRAY[
    'São Paulo - SP', 'Rio de Janeiro - RJ', 'Belo Horizonte - MG',
    'Curitiba - PR', 'Porto Alegre - RS', 'Salvador - BA',
    'Brasília - DF', 'Fortaleza - CE', 'Recife - PE',
    'Manaus - AM', 'Campinas - SP', 'Guarulhos - SP'
  ];
  
  education_levels TEXT[] := ARRAY[
    'Ensino Médio Completo',
    'Ensino Superior em andamento',
    'Ensino Superior Completo',
    'Pós-graduação',
    'Técnico Completo'
  ];
  
  v_job_id TEXT;
  v_candidate_id TEXT;
  v_first_name TEXT;
  v_last_name TEXT;
  v_full_name TEXT;
  v_email TEXT;
  v_phone TEXT;
  v_cpf TEXT;
  v_birth_date DATE;
  v_age INT;
  v_city TEXT;
  v_education TEXT;
  v_stage_id TEXT;
  v_candidates_per_job INT;
  i INT;
BEGIN
  -- Para cada vaga, criar entre 3 e 6 candidatos
  FOREACH v_job_id IN ARRAY job_ids
  LOOP
    v_candidates_per_job := 3 + floor(random() * 4)::INT; -- 3 a 6 candidatos
    
    FOR i IN 1..v_candidates_per_job
    LOOP
      -- Gerar dados do candidato
      v_first_name := first_names[1 + floor(random() * array_length(first_names, 1))::INT];
      v_last_name := last_names[1 + floor(random() * array_length(last_names, 1))::INT];
      v_full_name := v_first_name || ' ' || v_last_name;
      
      -- Email único com timestamp para evitar duplicatas
      v_email := lower(v_first_name) || '.' || lower(v_last_name) || 
                 floor(random() * 10000)::TEXT || '@email.com';
      
      -- Telefone brasileiro (DDD + 9 dígitos)
      v_phone := '(' || (11 + floor(random() * 89))::TEXT || ') 9' ||
                 (10000000 + floor(random() * 90000000))::TEXT;
      
      -- CPF formatado
      v_cpf := generate_cpf();
      
      -- Data de nascimento (entre 18 e 60 anos)
      v_age := 18 + floor(random() * 43)::INT;
      v_birth_date := CURRENT_DATE - (v_age * 365 + floor(random() * 365))::INT;
      
      -- Cidade aleatória
      v_city := cities[1 + floor(random() * array_length(cities, 1))::INT];
      
      -- Nível educacional
      v_education := education_levels[1 + floor(random() * array_length(education_levels, 1))::INT];
      
      -- Inserir candidato
      INSERT INTO candidates (
        id, name, email, phone, document, birth_date, education,
        skills, experience, notes, created_at, updated_at
      ) VALUES (
        gen_random_uuid(),
        v_full_name,
        v_email,
        v_phone,
        v_cpf,
        v_birth_date,
        v_education,
        'Trabalho em equipe, Comunicação eficaz, Proatividade',
        floor(1 + random() * 8)::TEXT || ' anos de experiência',
        'Candidato gerado para testes - ' || v_city,
        NOW(),
        NOW()
      ) RETURNING id INTO v_candidate_id;
      
      -- Selecionar stage aleatório do kanban
      v_stage_id := stage_ids[1 + floor(random() * array_length(stage_ids, 1))::INT];
      
      -- Criar application vinculada ao stage do kanban
      INSERT INTO applications (
        id, job_id, candidate_id, kanban_stage_id,
        status, overall_score, notes, applied_at, updated_at
      ) VALUES (
        gen_random_uuid(),
        v_job_id,
        v_candidate_id,
        v_stage_id,
        'under_review',
        60 + floor(random() * 40)::INT, -- Score entre 60-100
        'Aplicação de teste',
        NOW() - (floor(random() * 30))::INT * INTERVAL '1 day',
        NOW()
      );
    END LOOP;
  END LOOP;
  
  RAISE NOTICE 'Candidatos de teste criados com sucesso!';
END $$;

-- Limpar função auxiliar
DROP FUNCTION IF EXISTS generate_cpf();
