import { useState } from 'react';
import { Settings, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export function AdminButton() {
  const { user, isAdmin, signIn, signUp, signOut, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUpMode, setIsSignUpMode] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (isSignUpMode) {
      const { error } = await signUp(email, password);

      if (error) {
        toast.error('Error al registrarse: ' + error.message);
      } else {
        toast.success('Usuario creado. Ahora inicia sesión.');
        setIsSignUpMode(false);
      }
    } else {
      const { error } = await signIn(email, password);

      if (error) {
        toast.error('Error al iniciar sesión: ' + error.message);
      } else {
        toast.success('Sesión iniciada correctamente');
        setOpen(false);
        setEmail('');
        setPassword('');
      }
    }

    setIsLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Sesión cerrada');
  };

  if (loading) {
    return null;
  }

  if (user && isAdmin) {
    return (
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2">
        <Link to="/admin">
          <Button size="sm" variant="outline" className="gap-2">
            <Settings className="h-4 w-4" />
            Admin
          </Button>
        </Link>
        <Button size="sm" variant="ghost" onClick={handleSignOut}>
          Salir
        </Button>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="fixed bottom-4 right-4 z-50 opacity-20 hover:opacity-100 transition-opacity h-8 w-8"
          aria-label="Acceso administrador"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isSignUpMode ? 'Registro' : 'Acceso Administrador'}</DialogTitle>
          <DialogDescription>
            {isSignUpMode
              ? 'Crea una cuenta de administrador.'
              : 'Introduce tus credenciales para acceder al panel de administración.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@ejemplo.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading
              ? (isSignUpMode ? 'Registrando...' : 'Iniciando sesión...')
              : (isSignUpMode ? 'Registrarse' : 'Iniciar sesión')}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => setIsSignUpMode(!isSignUpMode)}
          >
            {isSignUpMode ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
