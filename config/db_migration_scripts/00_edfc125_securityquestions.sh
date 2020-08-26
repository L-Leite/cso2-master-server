psql cso2 cso2_user -c "ALTER TABLE users ADD COLUMN security_question_index integer;"
psql cso2 cso2_user -c "ALTER TABLE users ADD COLUMN security_answer_hash text;"