from fastapi import APIRouter

from app.core.deps import CurrentUser, DbSession
from app.core.security import encrypt_token
from app.models.whatsapp_account import WhatsAppAccount
from app.schemas.whatsapp import WhatsAppSettingsResponse, WhatsAppSettingsUpdate
from sqlalchemy import select

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("/whatsapp", response_model=WhatsAppSettingsResponse)
async def get_whatsapp_settings(user: CurrentUser, db: DbSession) -> WhatsAppSettingsResponse:
    result = await db.execute(
        select(WhatsAppAccount).where(WhatsAppAccount.organization_id == user.organization_id)
    )
    account = result.scalar_one_or_none()
    if not account:
        return WhatsAppSettingsResponse(
            phone_number_id=None,
            waba_id=None,
            display_phone_number=None,
            is_connected=False,
        )
    return WhatsAppSettingsResponse(
        phone_number_id=account.phone_number_id,
        waba_id=account.waba_id,
        display_phone_number=account.display_phone_number,
        is_connected=account.is_connected,
    )


@router.put("/whatsapp", response_model=WhatsAppSettingsResponse)
async def update_whatsapp_settings(
    body: WhatsAppSettingsUpdate,
    user: CurrentUser,
    db: DbSession,
) -> WhatsAppSettingsResponse:
    result = await db.execute(
        select(WhatsAppAccount).where(WhatsAppAccount.organization_id == user.organization_id)
    )
    account = result.scalar_one_or_none()
    if account:
        account.phone_number_id = body.phone_number_id
        account.access_token_encrypted = encrypt_token(body.access_token)
        account.waba_id = body.waba_id
        account.display_phone_number = body.display_phone_number
        account.is_connected = True
    else:
        account = WhatsAppAccount(
            organization_id=user.organization_id,
            phone_number_id=body.phone_number_id,
            access_token_encrypted=encrypt_token(body.access_token),
            waba_id=body.waba_id,
            display_phone_number=body.display_phone_number,
            is_connected=True,
        )
        db.add(account)
    await db.flush()
    return WhatsAppSettingsResponse(
        phone_number_id=account.phone_number_id,
        waba_id=account.waba_id,
        display_phone_number=account.display_phone_number,
        is_connected=account.is_connected,
    )
