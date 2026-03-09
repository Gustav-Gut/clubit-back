import { Body, Controller, Post, Get, Query, UnauthorizedException } from '@nestjs/common';
import { CurrentSchoolId } from '../auth/decorators/current-school-id.decorator';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    @Post('create-link')
    createLink(
        @Body() createPaymentDto: CreatePaymentDto,
        @CurrentSchoolId() schoolId: string
    ) {
        return this.paymentsService.createPayment(
            createPaymentDto.amount,
            createPaymentDto.email,
            createPaymentDto.description,
            schoolId
        );
    }

    @Post('create-subscription')
    createSubscription(
        @Body() createSubscriptionDto: CreateSubscriptionDto,
        @CurrentSchoolId() schoolId: string
    ) {
        return this.paymentsService.createSubscription(
            createSubscriptionDto.price,
            createSubscriptionDto.email,
            createSubscriptionDto.reason,
            createSubscriptionDto.frequency,
            schoolId,
            createSubscriptionDto.studentId,
        );
    }

    @Get('subscriptions')
    getSubscriptions(
        @Query('email') email: string,
        @CurrentSchoolId() schoolId: string
    ) {
        return this.paymentsService.getSubscriptions(email, schoolId);
    }

    @Post('webhook')
    async handleWebhook(@Body() body: any) {
        // Respondemos 200 OK rápido a MercadoPago para que sepa que recibimos el mensaje
        // El procesamiento lo hacemos asíncrono (sin await) o síncrono si es rápido.
        await this.paymentsService.handleWebhook(body);
        return { status: 'OK' };
    }
}