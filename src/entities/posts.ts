import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('Posts')
export class PostEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column("text")
    text: string;

}