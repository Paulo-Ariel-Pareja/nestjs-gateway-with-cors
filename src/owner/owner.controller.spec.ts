import { Test, TestingModule } from '@nestjs/testing';
import { OwnerController } from './owner.controller';
import { OwnerService } from './owner.service';
import { Owner } from '../models/owner.models';
import { OwnerDto } from 'src/dto/owner.dto';

describe('OwnerController', () => {
    let controller: OwnerController;
    let service: OwnerService;

    beforeEach(async () => {
        const ApiServiceProvider = {
            provide: OwnerService,
            useFactory: () => ({
                create: jest.fn(() => true),
                getMessagesActive: jest.fn(() => true),
                getOneMessage: jest.fn(() => true),
                removeMessage: jest.fn(() => true),
            }),
        };
        const app: TestingModule = await Test.createTestingModule({
            controllers: [OwnerController],
            providers: [OwnerService, ApiServiceProvider],
        }).compile();
        controller = app.get<OwnerController>(OwnerController);
        service = app.get<OwnerService>(OwnerService);
    });

    afterEach(() => {
        jest.restoreAllMocks();
        jest.resetAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
        expect(service).toBeDefined();
    });

    describe('create Method', () => {
        it('should create a new owner', async () => {
            const body: unknown = {
                uuid: '1',
                messages: [{ message: 'hola soy un mensaje' }]
            };
            const mockResult: unknown = {
                uuid: '1',
                messages: [{ message: 'hola soy un mensaje' }]
            };
            jest.spyOn(service, 'create').mockImplementation(async () => mockResult as Promise<Owner>);
            const owner = await controller.create(body as OwnerDto);
            expect(owner.owner.uuid).toBe('1');
        });

         it('should throw error on create a new owner', async () => {
            jest.spyOn(service, 'create').mockImplementation(() => {
                throw new Error('Some error');
            });
            const body: unknown = {
                uuid: '1',
                messages: [{ message: 'hola soy un mensaje' }]
            };
            try {
                await controller.create(body as OwnerDto);
            } catch (e) {
                expect(e.message).toBe('Some error');
                expect(e.status).toBe(400);
                expect(e.response.error).toBe('Bad Request');
            }
        });
    });

    describe('getMessages Method', () => {
        it('should get an owner messages', async () => {
            const mockResult: unknown = {
                uuid: '1233',
                messages: []
            };
            jest.spyOn(service, 'getMessagesActive').mockImplementation(async () => mockResult as Promise<Owner>);
            const owner = await controller.getMessages('1233');
            expect(owner.owner.uuid).toBe('1233');
        });

        it('should throw error on get an owner messages', async () => {
            jest.spyOn(service, 'getMessagesActive').mockImplementation(() => {
                throw new Error('Not Found Exception');
            });
            try {
                await controller.getMessages('123');
            } catch (e) {
                expect(e.message).toBe('Not Found Exception');
                expect(e.status).toBe(400);
                expect(e.response.error).toBe('Bad Request');
            }
        });
    });

    describe('getMessage Method', () => {
        it('should get an owner with unique messages', async () => {
            const mockResult: unknown = [{
                messages: [{ messages: '1' }]
            }];
            jest.spyOn(service, 'getOneMessage').mockImplementation(async () => mockResult as Promise<any>);
            const owner = await controller.getMessage('1233', '1');
            expect(owner.message.length).toBe(1);
            expect(owner.status).toBe('ok');
        });

        it('should throw error on get an owner messages', async () => {
            jest.spyOn(service, 'getOneMessage').mockImplementation(() => {
                throw new Error('Not Found Exception');
            });
            try {
                await controller.getMessage('123', '1');
            } catch (e) {
                expect(e.message).toBe('Not Found Exception');
                expect(e.status).toBe(400);
                expect(e.response.error).toBe('Bad Request');
            }
        });
    });

    describe('deleteMessage Method', () => {
        it('should get an owner with unique messages', async () => {
            const mockResult: unknown = {
                uuid: '1233',
                messages: []
            };
            jest.spyOn(service, 'removeMessage').mockImplementation(async () => mockResult as Promise<any>);
            const resp = await controller.deleteMessage('1233', '1');
            expect(resp.owner.messages.length).toBe(0);
            expect(resp.status).toBe('ok');
        });

        it('should throw error on get an owner messages', async () => {
            jest.spyOn(service, 'removeMessage').mockImplementation(() => {
                throw new Error('Not Found Exception');
            });
            try {
                await controller.deleteMessage('123', '1');
            } catch (e) {
                expect(e.message).toBe('Not Found Exception');
                expect(e.status).toBe(400);
                expect(e.response.error).toBe('Bad Request');
            }
        });
    });
});