import type { Stadium } from "@domain/entities";

export interface StadiumRepository {
  findAll(): Promise<Stadium[]>;
}
