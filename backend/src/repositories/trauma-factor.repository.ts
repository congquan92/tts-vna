import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { TraumaFactor } from '../entities/trauma-factor.entity';

@Injectable()
export class TraumaFactorRepository extends Repository<TraumaFactor> {
  constructor(private dataSource: DataSource) {
    super(TraumaFactor, dataSource.createEntityManager());
  }
}