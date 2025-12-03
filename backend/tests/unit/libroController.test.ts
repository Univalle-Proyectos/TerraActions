import { describe, it, expect, beforeEach, vi } from "vitest";
import { Request, Response } from "express";
import { LibroController } from "../../Controllers/LibroController";
import { Libro } from "../../Models/Libro";


const librosMock: Libro[] = [
  {
    idLibro: 1,
    isbn: "1234567890",
    titulo: "Libro 1",
    portada: "portada1.jpg",
    sinopsis: "Sinopsis del Libro 1",
    genero: "Ficción",
    editorial: "Editorial A",
    fechaPublicacion: new Date("2022-01-01"),
  },
  {
    idLibro: 2,
    isbn: "0987654321",
    titulo: "JS Avanzado",
    sinopsis: "Aprende JS a fondo",
    genero: "Educativo",
    editorial: "Editorial B",
    fechaPublicacion: new Date("2023-03-15"),
  },
  {
    idLibro: 3,
    isbn: "1112223334",
    titulo: "Cuentos de terror",
    sinopsis: "Historias de miedo",
    genero: "Terror",
    editorial: "Editorial C",
    fechaPublicacion: new Date("2021-10-31"),
  },
];

describe("LibroController con datos estáticos según modelo Libro", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let json: any;
  let status: any;

  beforeEach(() => {
    req = {};
    json = vi.fn();
    status = vi.fn(() => ({ json }));
    res = { status };
    vi.clearAllMocks();
  });

  it("getLibro debería retornar todos los libros", async () => {
    vi.spyOn(LibroController, "getLibro").mockImplementation(async (_req, res) => {
      res.status!(200).json(librosMock);
    });

    await LibroController.getLibro(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith(librosMock);
  });

  it("getLibroId debería retornar libro por id", async () => {
    req = { params: { id: "2" } };

    vi.spyOn(LibroController, "getLibroId").mockImplementation(async (req, res) => {
      const libro = librosMock.find(l => l.idLibro === Number(req.params.id));
      res.status!(200).json({ data: libro, message: "Libro obtenido correctamente" });
    });

    await LibroController.getLibroId(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({
      data: {
        idLibro: 2,
        isbn: "0987654321",
        titulo: "JS Avanzado",
        sinopsis: "Aprende JS a fondo",
        genero: "Educativo",
        editorial: "Editorial B",
        fechaPublicacion: new Date("2023-03-15"),
      },
      message: "Libro obtenido correctamente",
    });
  });

  it("getLibroPorTitulo debería retornar libros por título", async () => {
    req = { params: { titulo: "JS" } };

    vi.spyOn(LibroController, "getLibroPorTitulo").mockImplementation(async (req, res) => {
      const libros = librosMock.filter(l => l.titulo.includes(req.params.titulo));
      res.status!(200).json({ data: libros, message: "Libros encontrados" });
    });

    await LibroController.getLibroPorTitulo(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({
      data: [
        {
          idLibro: 2,
          isbn: "0987654321",
          titulo: "JS Avanzado",
          sinopsis: "Aprende JS a fondo",
          genero: "Educativo",
          editorial: "Editorial B",
          fechaPublicacion: new Date("2023-03-15"),
        },
      ],
      message: "Libros encontrados",
    });
  });

  it("getLibroPorGenero debería retornar libros por género", async () => {
    req = { params: { genero: "Ficción" } };

    vi.spyOn(LibroController, "getLibroPorGenero").mockImplementation(async (req, res) => {
      const libros = librosMock.filter(l => l.genero === req.params.genero);
      res.status!(200).json({ data: libros, message: `Libros del género '${req.params.genero}' encontrados` });
    });

    await LibroController.getLibroPorGenero(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({
      data: [
        {
          idLibro: 1,
          isbn: "1234567890",
          titulo: "Libro 1",
          portada: "portada1.jpg",
          sinopsis: "Sinopsis del Libro 1",
          genero: "Ficción",
          editorial: "Editorial A",
          fechaPublicacion: new Date("2022-01-01"),
        },
      ],
      message: "Libros del género 'Ficción' encontrados",
    });
  });
});
