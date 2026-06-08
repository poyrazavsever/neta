-- 0008: Add Project Progress Type and Revision Quota

-- Add columns to projects table
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS progress_type text DEFAULT 'manual'::text CHECK (progress_type IN ('manual', 'auto')),
ADD COLUMN IF NOT EXISTS revision_quota integer DEFAULT 0;

-- Function to update project progress automatically if progress_type is 'auto'
CREATE OR REPLACE FUNCTION public.update_project_progress_on_task_change()
RETURNS TRIGGER AS $$
DECLARE
  v_project_id uuid;
  v_progress_type text;
  v_total_tasks integer;
  v_done_tasks integer;
  v_new_progress integer;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_project_id := OLD.project_id;
  ELSE
    v_project_id := NEW.project_id;
  END IF;

  IF v_project_id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT progress_type INTO v_progress_type FROM public.projects WHERE id = v_project_id;

  IF v_progress_type = 'auto' THEN
    SELECT count(*) INTO v_total_tasks FROM public.tasks WHERE project_id = v_project_id;
    SELECT count(*) INTO v_done_tasks FROM public.tasks WHERE project_id = v_project_id AND status = 'done';

    IF v_total_tasks > 0 THEN
      v_new_progress := round((v_done_tasks::numeric / v_total_tasks::numeric) * 100);
    ELSE
      v_new_progress := 0;
    END IF;

    UPDATE public.projects SET progress = v_new_progress WHERE id = v_project_id;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to recalculate progress when tasks are modified
DROP TRIGGER IF EXISTS trigger_update_project_progress ON public.tasks;
CREATE TRIGGER trigger_update_project_progress
AFTER INSERT OR UPDATE OF status OR DELETE
ON public.tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_project_progress_on_task_change();

-- Trigger to recalculate progress when a project's progress_type is changed to 'auto'
CREATE OR REPLACE FUNCTION public.update_project_progress_on_type_change()
RETURNS TRIGGER AS $$
DECLARE
  v_total_tasks integer;
  v_done_tasks integer;
  v_new_progress integer;
BEGIN
  IF NEW.progress_type = 'auto' AND (OLD.progress_type IS DISTINCT FROM NEW.progress_type) THEN
    SELECT count(*) INTO v_total_tasks FROM public.tasks WHERE project_id = NEW.id;
    SELECT count(*) INTO v_done_tasks FROM public.tasks WHERE project_id = NEW.id AND status = 'done';

    IF v_total_tasks > 0 THEN
      v_new_progress := round((v_done_tasks::numeric / v_total_tasks::numeric) * 100);
    ELSE
      v_new_progress := 0;
    END IF;
    
    NEW.progress := v_new_progress;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_project_progress_type ON public.projects;
CREATE TRIGGER trigger_update_project_progress_type
BEFORE UPDATE OF progress_type
ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.update_project_progress_on_type_change();
