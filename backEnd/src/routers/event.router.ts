import  express  from "express";
import { getAllEvents } from "../services/event.services";
import { authMiddleware } from '../middlewares/auth';
import { roleMiddleware } from '../middlewares/role';


const router = express.Router();

router.get('/', async (req, res, next) => {
	try {
		const events = await getAllEvents();
		res.json(events);
	} catch (error) {
		next(error);
	}
});


export default router;