import os
import shutil

class ProjectGenerator:
    def generate(self, project_type, project_name):
        if project_type == 'crud':
            self._create_crud_project(project_name)
        elif project_type == 'api':
            self._create_api_project(project_name)

    def _create_crud_project(self, project_name):
        template_dir = 'templates/crud_template'
        self._copy_template(template_dir, project_name)
        print(f'Proyecto CRUD "{project_name}" creado con éxito.')

    def _create_api_project(self, project_name):
        template_dir = 'templates/api_template'
        self._copy_template(template_dir, project_name)
        print(f'Proyecto API "{project_name}" creado con éxito.')

    def _copy_template(self, template_dir, project_name):
        target_dir = os.path.join(os.getcwd(), project_name)
        shutil.copytree(template_dir, target_dir)
