import db from "../database/connection";
import convertHourToMinutes from "../utils/convertHourToMinutes";
import { Request, Response } from "express";

interface Item {
  week_day: number;
  from: string;
  to: string;
}

export default class ClassessController {
  async index(req: Request, res: Response) {
    const filters = req.query;

    const time = filters.time as string;
    const materia = filters.materia as string;
    const week_day = filters.week_day as string;

    if (!filters.week_day || !filters.materia || !filters.time) {
      return res.status(400).json({
        erro: "faltando filtros",
      });
    }

    const timeInMinutes = convertHourToMinutes(time);

    const classes = await db("classes")
      .whereExists(function () {
        this.select("class_schedule.*")
          .from("class_schedule")
          .whereRaw("`class_schedule`.`class_id` = `classes`.`id`")
          .whereRaw("`class_schedule`.`week_day` = ??", [Number(week_day)])
          .whereRaw("`class_schedule`.`from` <= ??", [timeInMinutes])
          .whereRaw("`class_schedule`.`to` > ??", [timeInMinutes]);
      })
      .where("classes.materia", "=", materia)
      .join("usuarios", "classes.user_id", "=", "usuarios.id")
      .select(["classes.*", "usuarios.*"]);

    return res.json(classes);
  }

  async create(req: Request, res: Response) {
    const { name, avatar, whatsapp, bio, materia, custo, schedule } = req.body;

    const trx = await db.transaction();

    try {
      const insertedUserIds = await trx("usuarios").insert({
        name,
        avatar,
        whatsapp,
        bio,
      });

      const user_id = insertedUserIds[0];

      const insertedClassesIds = await trx("classes").insert({
        materia,
        custo,
        user_id,
      });

      const class_id = insertedClassesIds[0];

      const classSchedule = schedule.map((item: Item) => {
        return {
          class_id,
          week_day: item.week_day,
          from: convertHourToMinutes(item.from),
          to: convertHourToMinutes(item.to),
        };
      });

      await trx("class_schedule").insert(classSchedule);

      trx.commit();

      return res.status(201).send();
    } catch (e) {
      await trx.rollback();
      return res.status(400).json({
        erro: "deu erro",
      });
    }
  }
}
