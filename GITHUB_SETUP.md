# Configuración de GitHub - PaliWallet

## Información del Repositorio

- **Nombre**: Demo_Svelte_Blockchain
- **Estándar de Nombre**: AS232S6_##_nameDApp
- **Organización**: VALLE GRANDE
- **Rama Principal**: develop
- **Visibilidad**: Privado

## Pasos para Agregar Monitores al Repositorio

### 1. Acceder a Configuración del Repositorio

1. Ve a: https://github.com/vallegrande/Demo_Svelte_Blockchain
2. Haz clic en **Settings** (Configuración)
3. En el menú lateral, selecciona **Collaborators and teams** (Colaboradores y equipos)

### 2. Agregar Colaboradores

#### Opción A: Agregar Usuarios Individuales

1. Haz clic en **Add people** (Agregar personas)
2. Busca el nombre de usuario de GitHub del monitor
3. Selecciona el rol:
   - **Maintain**: Acceso completo (recomendado para monitores)
   - **Write**: Puede hacer push y pull requests
   - **Triage**: Puede gestionar issues y pull requests
   - **Read**: Solo lectura

4. Haz clic en **Send invitation** (Enviar invitación)

#### Opción B: Crear un Equipo

1. Ve a **Teams** en la organización
2. Haz clic en **New team** (Nuevo equipo)
3. Nombre: `Monitores-PaliWallet`
4. Descripción: "Equipo de monitores para el proyecto PaliWallet"
5. Privacidad: Privado
6. Haz clic en **Create team** (Crear equipo)

### 3. Configurar Permisos de Rama

1. Ve a **Settings** → **Branches**
2. Selecciona la rama `develop`
3. Habilita **Require pull request reviews before merging**
4. Establece el número de revisiones requeridas (ej: 1)
5. Habilita **Require status checks to pass before merging**

### 4. Configurar Protecciones de Rama

1. Ve a **Settings** → **Branch protection rules**
2. Haz clic en **Add rule** (Agregar regla)
3. Patrón de rama: `develop`
4. Habilita:
   - ✅ Require a pull request before merging
   - ✅ Require approvals (1 aprobación)
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Include administrators

### 5. Configurar Notificaciones

1. Ve a **Settings** → **Notifications**
2. Habilita notificaciones para:
   - Pull requests
   - Issues
   - Discussions

## Roles Recomendados

### Para Monitores
- **Rol**: Maintain
- **Permisos**:
  - Crear y eliminar ramas
  - Hacer push a ramas protegidas (con revisión)
  - Revisar pull requests
  - Gestionar issues
  - Acceso a configuración

### Para Desarrolladores
- **Rol**: Write
- **Permisos**:
  - Hacer push a ramas
  - Crear pull requests
  - Comentar en issues

### Para Revisores
- **Rol**: Triage
- **Permisos**:
  - Revisar pull requests
  - Gestionar issues
  - Sin acceso a configuración

## Checklist de Configuración

- [ ] Repositorio creado en organización VALLE GRANDE
- [ ] Rama `develop` creada
- [ ] Monitores agregados como colaboradores
- [ ] Permisos configurados correctamente
- [ ] Protecciones de rama habilitadas
- [ ] Notificaciones configuradas
- [ ] README actualizado
- [ ] DEVELOPMENT.md creado
- [ ] Código inicial pusheado

## Usuarios a Agregar (Ejemplo)

Reemplaza con los nombres de usuario reales:

```
- @monitor1 (Maintain)
- @monitor2 (Maintain)
- @developer1 (Write)
- @developer2 (Write)
```

## Comandos Git Útiles

### Crear rama develop localmente
```bash
git checkout -b develop
git push -u origin develop
```

### Proteger rama develop
```bash
# Esto se hace desde GitHub UI, no desde CLI
```

### Crear pull request
```bash
git checkout -b feature/nueva-caracteristica
git commit -m "feat: descripción"
git push origin feature/nueva-caracteristica
# Luego crear PR desde GitHub UI
```

## Flujo de Trabajo Recomendado

1. **Crear rama de feature**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/nombre-feature
   ```

2. **Hacer cambios y commits**
   ```bash
   git add .
   git commit -m "feat: descripción"
   ```

3. **Push a GitHub**
   ```bash
   git push origin feature/nombre-feature
   ```

4. **Crear Pull Request**
   - Ir a GitHub
   - Crear PR hacia `develop`
   - Agregar descripción
   - Solicitar revisión de monitor

5. **Revisión y Merge**
   - Monitor revisa el código
   - Aprueba o solicita cambios
   - Merge a `develop`

## Estándares de Commit

```
feat: agregar nueva característica
fix: corregir bug
docs: actualizar documentación
style: cambios de formato
refactor: refactorizar código
test: agregar tests
chore: tareas de mantenimiento
```

## Protecciones de Seguridad

1. **Dos factores de autenticación (2FA)**
   - Requerido para todos los colaboradores
   - Configurar en GitHub Settings

2. **SSH Keys**
   - Usar SSH en lugar de HTTPS
   - Generar y agregar SSH key

3. **Secrets**
   - No agregar secrets en el código
   - Usar GitHub Secrets para variables sensibles

## Recursos Útiles

- [GitHub Docs - Collaborators](https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-personal-account-on-github/managing-access-to-your-personal-repositories/inviting-collaborators-to-a-personal-repository)
- [GitHub Docs - Branch Protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [GitHub Docs - Teams](https://docs.github.com/en/organizations/organizing-members-into-teams)

## Soporte

Para preguntas sobre configuración de GitHub:
- Contactar al administrador del repositorio
- Revisar documentación oficial de GitHub
- Crear issue en el repositorio
