package integrador.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "detalle_servicio")
public class DetalleServicio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_servicio", nullable = false)
    private Servicio servicio;

    @ManyToOne
    @JoinColumn(name = "id_insumo", nullable = false)
    private Insumo insumo;

    @Column(name = "cantidad_usada", nullable = false)
    private Integer cantidadUsada;

    public DetalleServicio() {
    }

    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }

    public Servicio getServicio() {
        return servicio;
    }
    public void setServicio(Servicio servicio) {
        this.servicio = servicio;
    }

    public Insumo getInsumo() {
        return insumo;
    }
    public void setInsumo(Insumo insumo) {
        this.insumo = insumo;
    }

    public Integer getCantidadUsada() {
        return cantidadUsada;
    }
    public void setCantidadUsada(Integer cantidadUsada) {
        this.cantidadUsada = cantidadUsada;
    }

}