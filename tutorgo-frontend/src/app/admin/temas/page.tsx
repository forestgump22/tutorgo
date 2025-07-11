"use client";

import { useEffect, useState, FormEvent } from "react";
import { Tema } from "@/models/tema.models";
import { getAllTemas } from "@/services/tema.service";
import api from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Trash2, Edit2, CheckCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AdminTemasPage() {
  const [temas, setTemas] = useState<Tema[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Formulario de agregar/editar
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Cargar temas
  const fetchTemas = () => {
    setLoading(true);
    getAllTemas()
      .then(setTemas)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };
  useEffect(fetchTemas, []);

  // Agregar o editar tema
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError(null);
    setSuccess(null);
    try {
      if (editId) {
        await api.put(`/temas/${editId}`, { nombre, descripcion });
        setSuccess("Tema editado correctamente.");
      } else {
        await api.post("/temas", { nombre, descripcion });
        setSuccess("Tema agregado correctamente.");
      }
      setNombre("");
      setDescripcion("");
      setEditId(null);
      fetchTemas();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  // Eliminar tema
  const handleDelete = async (id: number) => {
    if (!confirm("¿Seguro que deseas eliminar este tema?")) return;
    setFormLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await api.delete(`/temas/${id}`);
      setSuccess("Tema eliminado correctamente.");
      fetchTemas();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  // Editar tema
  const handleEdit = (tema: Tema) => {
    setEditId(tema.id);
    setNombre(tema.nombre);
    setDescripcion(tema.descripcion || "");
  };

  // Cancelar edición
  const handleCancelEdit = () => {
    setEditId(null);
    setNombre("");
    setDescripcion("");
  };

  return (
    <div className="max-w-3xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Gestión de Temas</h1>
      {success && (
        <Alert className="mb-4 border-green-200 bg-green-50 text-green-700">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{editId ? "Editar Tema" : "Agregar Nuevo Tema"}</CardTitle>
          <CardDescription>
            {editId ? "Modifica los datos del tema seleccionado." : "Completa los campos para agregar un nuevo tema."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Nombre del tema"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              required
              disabled={formLoading}
            />
            <Textarea
              placeholder="Descripción (opcional)"
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              disabled={formLoading}
            />
            <div className="flex gap-4">
              <Button type="submit" disabled={formLoading}>
                {formLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {editId ? "Guardar Cambios" : "Agregar Tema"}
              </Button>
              {editId && (
                <Button type="button" variant="outline" onClick={handleCancelEdit} disabled={formLoading}>
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Temas Existentes</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-10 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></div>
          ) : (
            <div className="space-y-4">
              {temas.length === 0 && <p className="text-gray-500">No hay temas registrados.</p>}
              {temas.map(tema => (
                <div key={tema.id} className="flex items-center gap-4 border-b pb-2">
                  <div className="flex-1">
                    <div className="font-semibold text-lg">{tema.nombre}</div>
                    <div className="text-gray-600 text-sm">{tema.descripcion}</div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleEdit(tema)} disabled={formLoading}>
                    <Edit2 className="h-4 w-4 mr-1" /> Editar
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(tema.id)} disabled={formLoading}>
                    <Trash2 className="h-4 w-4 mr-1" /> Eliminar
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 