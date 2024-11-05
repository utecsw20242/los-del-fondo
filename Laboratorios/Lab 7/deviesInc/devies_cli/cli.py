import click
from project_generator import ProjectGenerator

@click.group()
def cli():
    pass

@cli.command()
@click.argument('project_type', type=click.Choice(['crud', 'api'], case_sensitive=False))
@click.argument('project_name')
def create(project_type, project_name):
    generator = ProjectGenerator()
    generator.generate(project_type, project_name)

if __name__ == '__main__':
    cli()
