select cron.unschedule(jobname)
from cron.job
where jobname = 'morrow-post-stay-feedback-daily';

select cron.schedule(
  'morrow-post-stay-feedback-daily',
  '15 7 * * *',
  $$
  select
    net.http_post(
      url := (select decrypted_secret from vault.decrypted_secrets where name = 'morrow_project_url') || '/functions/v1/post-stay-feedback',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'morrow_publishable_key'),
        'apikey', (select decrypted_secret from vault.decrypted_secrets where name = 'morrow_publishable_key'),
        'x-morrow-automation-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'morrow_automation_secret')
      ),
      body := jsonb_build_object(
        'daysAfter', 1,
        'limit', 50
      )
    ) as request_id;
  $$
);

notify pgrst, 'reload schema';
